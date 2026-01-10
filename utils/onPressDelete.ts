import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { buildNewCount } from './buildNewCount';
import type { ReactiveVar } from '@apollo/client';
import { SQLiteDatabase } from 'expo-sqlite';
import { Count, SetShowOptionsMenu } from '../types';

export const onPressDelete = (
  count: Count,
  countsVar: ReactiveVar<Count[]>,
  db: SQLiteDatabase,
  setShowOptionsMenu: SetShowOptionsMenu
) => {
  setShowOptionsMenu(false);
  Alert.alert(
    `Delete ${count.title}`,
    'Are you sure? This cannot be undone.',
    [
      {
        style: 'cancel',
        text: 'Cancel'
      },
      {
        onPress: async () => {
          if (!count.id) {
            throw new Error('onPressDelete(): Count id is falsey.');
          }

          try {
            await db.runAsync('DELETE FROM savedCounts WHERE id = ?', [count.id]);
          } catch (e) {
            console.error('Error deleting count from database: ', e);
            Alert.alert('Error', 'Failed to delete the count. Please try again later.');
            return;
          }

          const updatedCounts = [buildNewCount(), ...countsVar().filter(c => c.id !== count.id)];
          countsVar(updatedCounts);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        style: 'destructive',
        text: 'Delete'
      }
    ],
    { cancelable: true }
  );
};
