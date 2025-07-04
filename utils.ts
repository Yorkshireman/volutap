import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { SQLiteDatabase } from 'expo-sqlite';
import type { Count, DbCount, SetCount } from './types';

export const onPressReset = (count: Count, setCount: SetCount) => {
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
  setCount: SetCount
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

export const transformDbCountToCount = (dbCount: DbCount): Count => ({
  createdAt: dbCount.createdAt,
  id: dbCount.id,
  lastModified: dbCount.lastModified,
  title: dbCount.title,
  value: dbCount.count
});
