import { SQLiteDatabase } from 'expo-sqlite';
import type { Count, DbCount } from '../types';

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

    console.info('saveCountToDb(): Count saved successfully:', JSON.stringify(count, null, 2));
  } catch (e) {
    console.error('Error saving count to database: ', e);
  }
};
