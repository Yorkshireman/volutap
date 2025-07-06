import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { SQLiteDatabase } from 'expo-sqlite';
import type { Count, SetCount, SetDropdownVisible, SetShowSaveInputField } from './types';

export const onPressDelete = (count: Count, db: SQLiteDatabase, setCount: SetCount) => {
  Alert.alert(
    'Delete Saved Count',
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

          setCount({ value: 0 });
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        text: 'Delete'
      }
    ],
    { cancelable: true }
  );
};

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

export const onSelectCount = async ({
  count,
  db,
  id,
  setCount,
  setDropdownVisible,
  setShowSaveInputField
}: {
  count: Count;
  db: SQLiteDatabase;
  id: Count['id'];
  setCount: SetCount;
  setDropdownVisible: SetDropdownVisible;
  setShowSaveInputField: SetShowSaveInputField;
}) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

  if (!count.id && count.value) {
    Alert.alert(
      'Save Current Count?',
      'You have a count in progress. Do you want to save it before switching?',
      [
        {
          onPress: async () => {
            if (!id) {
              console.error('No count ID provided.');
              return;
            }

            await db.runAsync('UPDATE savedCounts SET currentlyCounting = ? WHERE id = ?', [
              true,
              id
            ]);

            const newCount: Count | null = await db.getFirstAsync(
              'SELECT * FROM savedCounts WHERE currentlyCounting = ?',
              [true]
            );

            if (!newCount) {
              console.error('No new count with currentlyCounting true found after update.');
              return;
            }

            setCount(newCount);
            setDropdownVisible(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          },
          text: 'Proceed Without Saving'
        },
        {
          onPress: () => {
            setShowSaveInputField(true);
          },
          style: 'cancel',
          text: 'Save'
        }
      ]
    );

    return;
  }

  try {
    await db.runAsync('UPDATE savedCounts SET currentlyCounting = ? WHERE id = ?', [
      false,
      count.id || ''
    ]);

    await db.runAsync('UPDATE savedCounts SET currentlyCounting = ? WHERE id = ?', [
      true,
      id || ''
    ]);

    const newCount: Count | null = await db.getFirstAsync(
      'SELECT * FROM savedCounts WHERE currentlyCounting = ?',
      [true]
    );

    if (!newCount) {
      console.error('No new count with currentlyCounting true found after update.');
      return;
    }

    setCount(newCount);
    setDropdownVisible(false);
  } catch (error) {
    console.error('onSelectCount(): ', error);
  }
};
