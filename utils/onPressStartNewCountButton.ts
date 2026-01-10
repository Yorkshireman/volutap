import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { buildNewCount } from './buildNewCount';
import { Count } from '../types';
import type { ReactiveVar } from '@apollo/client';
import { SQLiteDatabase } from 'expo-sqlite';

export const onPressStartNewCountButton = async (
  count: Count,
  countsVar: ReactiveVar<Count[]>,
  db: SQLiteDatabase
) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  Alert.alert(
    'Start New Count',
    'Are you sure?',
    [
      {
        style: 'cancel',
        text: 'Cancel'
      },
      {
        onPress: async () => {
          if (!count.id) return;

          try {
            await db.runAsync('UPDATE savedCounts SET currentlyCounting = ? WHERE id = ?', [
              0,
              count.id
            ]);

            countsVar([
              buildNewCount(),
              ...countsVar().map(c => ({ ...c, currentlyCounting: 0 as const }))
            ]);

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch (e) {
            console.error('Error updating currentlyCounting in database: ', e);
          }
        },
        text: 'OK'
      }
    ],
    { cancelable: true }
  );
};
