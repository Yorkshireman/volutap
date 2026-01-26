import { sanitiseCountForTracking } from './sanitiseCountForTracking';
import { SQLiteDatabase } from 'expo-sqlite';
import { track } from '@amplitude/analytics-react-native';
import { Count, DbCount, Screens } from '../types';

export const saveCountToDb = async ({
  count,
  db,
  screen,
  source
}: {
  count: Count;
  db: SQLiteDatabase;
  screen?: Screens;
  source?: string;
}) => {
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
    track('count_saved', { count: sanitiseCountForTracking(count), screen, source });
  } catch (error) {
    console.error('Error saving count to database: ', error);
    track('error', { error, message: 'Error saving count to database.', screen, source });
  }
};
