import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import type { ReactiveVar } from '@apollo/client';
import { SQLiteDatabase } from 'expo-sqlite';
import uuid from 'react-native-uuid';
import type {
  Count,
  DbCount,
  SetDropdownVisible,
  SetShowOptionsMenu,
  SetShowSaveInputField
} from './types';

export const buildNewCount = (): Count => ({
  alerts: [],
  createdAt: new Date().toISOString(),
  currentlyCounting: 1,
  id: uuid.v4(),
  lastModified: new Date().toISOString(),
  saved: 0,
  value: 0
});

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
          updateCountInDb(updatedCount, db);
        },
        text: 'OK'
      }
    ],
    { cancelable: true }
  );
};

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

            countsVar([buildNewCount(), ...countsVar().map(c => ({ ...c, currentlyCounting: 0 }))]);
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
  countVar,
  db,
  id,
  setDropdownVisible,
  setShowSaveInputField
}: {
  count: Count;
  countVar: ReactiveVar<Count>;
  db: SQLiteDatabase;
  id: Count['id'];
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

            const newCount = await db.getFirstAsync<DbCount>(
              'SELECT * FROM savedCounts WHERE currentlyCounting = ?',
              [true]
            );

            if (!newCount) {
              console.error('No new count with currentlyCounting true found after update.');
              return;
            }

            const alerts = JSON.parse(newCount.alerts);
            countVar({ ...newCount, alerts });
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

  countVar({ ...count, currentlyCounting: 0 });
  try {
    const newCount = await db.getFirstAsync<DbCount>('SELECT * FROM savedCounts WHERE id = ?', [
      id || ''
    ]);

    if (!newCount) {
      console.error('No new count with currentlyCounting true found after update.');
      return;
    }

    const alerts = JSON.parse(newCount.alerts);
    countVar({ ...newCount, alerts, currentlyCounting: 1 });
    setDropdownVisible(false);
  } catch (error) {
    console.error('onSelectCount(): ', error);
    countVar({ ...count, currentlyCounting: 1 });
  }
};

export const saveCountToDb = async (count: Count, db: SQLiteDatabase) => {
  try {
    await db.runAsync(
      'INSERT INTO savedCounts (alerts, value, createdAt, currentlyCounting, id, lastModified, title) VALUES (?, ?, ?, ?, ?, ?, ?)',
      JSON.stringify(count.alerts),
      count.value,
      count.createdAt,
      count.currentlyCounting,
      count.id,
      count.lastModified,
      count.title as DbCount['title']
    );

    console.log('saveCountToDb(): Count saved successfully:', JSON.stringify(count, null, 2));
  } catch (e) {
    console.error('Error saving count to database: ', e);
  }
};

export const updateCountInDb = async (updatedCount: Count, db: SQLiteDatabase) => {
  try {
    await db.runAsync(
      `UPDATE savedCounts SET
        alerts = ?,
        createdAt = ?,
        currentlyCounting = ?,
        lastModified = ?,
        saved = ?,
        title = ?,
        value = ?
        WHERE id = ?`,
      [
        JSON.stringify(updatedCount.alerts),
        updatedCount.createdAt,
        updatedCount.currentlyCounting,
        updatedCount.lastModified,
        updatedCount.saved ? 1 : 0,
        updatedCount.title as DbCount['title'],
        updatedCount.value,
        updatedCount.id
      ]
    );

    console.log(
      'updateCountInDb(): Count updated successfully:',
      JSON.stringify(updatedCount, null, 2)
    );
  } catch (e) {
    console.error('Error updating count in database: ', e);
  }
};
