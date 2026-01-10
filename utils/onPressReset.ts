import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import type { Count } from '../types';
import type { ReactiveVar } from '@apollo/client';
import { SQLiteDatabase } from 'expo-sqlite';
import { updateCountInDb } from './updateCountInDb';

export const onPressReset = (count: Count, countsVar: ReactiveVar<Count[]>, db: SQLiteDatabase) => {
  if (count.value === 0) return;

  Alert.alert(
    'Reset',
    'Are you sure you want to reset the counter to zero?',
    [
      {
        style: 'cancel',
        text: 'Cancel'
      },
      {
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const counts = countsVar();
          const updatedCount: Count = {
            ...count,
            lastModified: new Date().toISOString(),
            value: 0
          };

          const updatedCounts = counts.map(c => (c.id === count.id ? updatedCount : c));
          countsVar(updatedCounts);
          if (!count.saved) return;
          updateCountInDb({ db, updatedCount });
        },
        text: 'OK'
      }
    ],
    { cancelable: true }
  );
};
