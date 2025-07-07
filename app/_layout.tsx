import { CountingModeProvider } from '../components';
import { PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { type SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';

export default function RootLayout() {
  return (
    <PaperProvider>
      <SQLiteProvider databaseName='counter.db' onInit={migrateDbIfNeeded}>
        <CountingModeProvider>
          <Stack>
            <Stack.Screen name='index' options={{ headerShown: false }} />
            <Stack.Screen name='settings' options={{ headerShown: false, presentation: 'modal' }} />
          </Stack>
          <StatusBar style='light' />
        </CountingModeProvider>
      </SQLiteProvider>
    </PaperProvider>
  );
}

const migrateDbIfNeeded = async (db: SQLiteDatabase) => {
  const DATABASE_VERSION = 1;
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentDbVersion = row?.user_version ?? 0;

  console.log('currentDbVersion: ', currentDbVersion);
  console.log('DATABASE_VERSION: ', DATABASE_VERSION);

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS savedCounts (
        value             INTEGER NOT NULL DEFAULT 0,
        createdAt         TEXT    NOT NULL,
        currentlyCounting INTEGER NOT NULL DEFAULT 1,
        id                TEXT    PRIMARY KEY NOT NULL,
        lastModified      TEXT    NOT NULL,
        title             TEXT    NOT NULL
      );
    `);

    currentDbVersion = 1;
  }

  // if (currentDbVersion === 1) {
  //   Add more migrations
  // }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
};
