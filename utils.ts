import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import type { Count } from './types';
import { SQLiteDatabase } from 'expo-sqlite';

export const onPressReset = (
  count: Count,
  setCount: React.Dispatch<React.SetStateAction<Count>>
) => {
  if (count.value === 0) return;

  Alert.alert(
    'Reset',
    'Are you sure you want to reset the counter to zero? This cannot be undone.',
    [
      {
        style: 'cancel',
        text: 'Cancel'
      },
      {
        onPress: async () => {
          setCount(prev => ({ ...prev, value: 0 }));
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        text: 'OK'
      }
    ],
    { cancelable: true }
  );
};

export const onPressStartNewCountButton = async (
  count: Count,
  db: SQLiteDatabase,
  setCount: React.Dispatch<React.SetStateAction<Count>>
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
              false,
              count.id
            ]);

            console.log(`Updated currentlyCounting to false for count with id: ${count.id}`);
            setCount({ value: 0 });
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
