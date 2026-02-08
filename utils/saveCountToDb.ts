import { sanitiseCountForTracking } from './sanitiseCountForTracking';
import { SQLiteDatabase } from 'expo-sqlite';
import { Count, DbCount, Screens, TrackingEventNames } from '../types';
import { promptForRating, track } from '../utils';

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
    track(
      TrackingEventNames.COUNT_SAVED,
      {
        count: sanitiseCountForTracking(count),
        screen,
        source
      },
      'saveCountToDb.ts'
    );

    await promptForRating({ consumer: 'saveCountToDb.ts', source });
  } catch (error) {
    console.error('Error saving count to database: ', error);
    track(
      TrackingEventNames.ERROR,
      {
        count: sanitiseCountForTracking(count),
        error,
        message: 'Error saving count to database.',
        screen,
        source
      },
      'saveCountToDb.ts'
    );
  }
};
