import { SQLiteDatabase } from 'expo-sqlite';
import { track } from '@amplitude/analytics-react-native';
import type { Count, DbCount } from '../types';

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

    console.info(
      'updateCountInDb(): Count updated successfully:',
      JSON.stringify(updatedCount, null, 2)
    );

    successCallback && successCallback();
  } catch (error) {
    console.error('updateCountInDb(): Error updating count in database: ', error);
    track('error', { error, message: 'updateCountInDb(): Error updating count in database.' });
    errorCallback && errorCallback();
  }
};
