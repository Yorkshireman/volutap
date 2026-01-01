import AsyncStorage from '@react-native-async-storage/async-storage';
import { countsVar } from '../reactiveVars';
import { PaperProvider } from 'react-native-paper';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFetchAndSetCountsOnMount } from '../hooks';
import { useReactiveVar } from '@apollo/client';
import { AlarmProvider, CountingModeProvider } from '../components';
import { ReactNode, Suspense, useEffect } from 'react';
import { type SQLiteDatabase, SQLiteProvider } from 'expo-sqlite';

const DataSetter = ({ children }: { children: ReactNode }) => {
  const counts = useReactiveVar(countsVar);
  useFetchAndSetCountsOnMount();

  useEffect(() => {
    AsyncStorage.setItem(
      'currentCount',
      JSON.stringify(countsVar().find(c => c.currentlyCounting))
    );
  }, [counts]);

  return <>{children}</>;
};

export default function RootLayout() {
  return (
    <PaperProvider>
      <Suspense fallback={null}>
        <SQLiteProvider databaseName='counter.db' onInit={migrateDbIfNeeded} useSuspense>
          <DataSetter>
            <CountingModeProvider>
              <AlarmProvider>
                <Stack>
                  <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
                  <Stack.Screen
                    name='settings'
                    options={{ headerShown: false, presentation: 'modal' }}
                  />
                  <Stack.Screen
                    name='settingsTroubleshooting'
                    options={{
                      animation: 'fade',
                      headerShown: false,
                      presentation: 'transparentModal'
                    }}
                  />
                </Stack>
                <StatusBar style='light' />
              </AlarmProvider>
            </CountingModeProvider>
          </DataSetter>
        </SQLiteProvider>
      </Suspense>
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
        alerts            TEXT    NOT NULL DEFAULT '[]',
        createdAt         TEXT    NOT NULL,
        currentlyCounting INTEGER NOT NULL DEFAULT 1,
        id                TEXT    PRIMARY KEY NOT NULL,
        lastModified      TEXT    NOT NULL,
        saved             INTEGER NOT NULL DEFAULT 1,
        title             TEXT    NOT NULL,
        value             INTEGER NOT NULL DEFAULT 0
      );
    `);

    currentDbVersion = 1;
  }

  // if (currentDbVersion === 1) {
  //   Add more migrations
  // }

  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
};
