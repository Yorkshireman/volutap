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
          updateCountInDb({ db, updatedCount });
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

export const onSelectCount = async ({
  countsVar,
  db,
  selectedCountId,
  setDropdownVisible,
  setShowSaveInputField
}: {
  countsVar: ReactiveVar<Count[]>;
  db: SQLiteDatabase;
  selectedCountId: Count['id'];
  setDropdownVisible: SetDropdownVisible;
  setShowSaveInputField: SetShowSaveInputField;
}) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const counts = countsVar();
  const selectedCount = counts.find(c => c.id === selectedCountId);

  if (!selectedCount) {
    console.error('onSelectCount(): No count found with the selected id.');
    return;
  }

  const currentCount = counts.find(c => c.currentlyCounting);

  if (!currentCount?.saved) {
    Alert.alert(
      'Save Current Count?',
      'You have a count in progress. Do you want to save it before switching?',
      [
        {
          onPress: async () => {
            const newSelectedCount = { ...selectedCount, currentlyCounting: 1 as const };
            const newCounts = counts
              .map(c => (c.id === selectedCount?.id ? newSelectedCount : c))
              .filter(c => c.id !== currentCount?.id);

            await updateCountInDb({ db, updatedCount: newSelectedCount });
            countsVar(newCounts);
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

  const newCurrentCount = { ...currentCount, currentlyCounting: 0 as const };

  const successCallback = () => {
    const newCounts = counts.map(c => (c.id === currentCount.id ? newCurrentCount : c));
    countsVar(newCounts);
  };

  await updateCountInDb({
    db,
    errorCallback: () => countsVar(counts),
    successCallback,
    updatedCount: newCurrentCount
  });

  setDropdownVisible(false);

  const currentCountsAfterFirstUpdate = countsVar();
  const newSelectedCount = { ...selectedCount, currentlyCounting: 1 as const };

  const successCallbackSecondUpdate = () => {
    const newCounts = countsVar().map(c => (c.id === selectedCount.id ? newSelectedCount : c));
    countsVar(newCounts);
  };

  await updateCountInDb({
    db,
    errorCallback: () => countsVar(currentCountsAfterFirstUpdate),
    successCallback: successCallbackSecondUpdate,
    updatedCount: newSelectedCount
  });
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

export const updateCountInDb = async ({
  updatedCount,
  db,
  errorCallback,
  successCallback
}: {
  updatedCount: Count;
  db: SQLiteDatabase;
  errorCallback?: () => void;
  successCallback?: () => void;
}) => {
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

    successCallback && successCallback();
  } catch (e) {
    console.error('updateCountInDb(): Error updating count in database: ', e);
    errorCallback && errorCallback();
  }
};
