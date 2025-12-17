import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildNewCount } from '../utils';
import { countsVar } from '../reactiveVars';
import { useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { Count, DbCount } from '../types';

const logMessage = (message: string, data?: any) => {
  if (data) {
    console.log(`useFetchAndSetCountsOnMount(): ${message}: `, data);
  } else {
    console.log(`useFetchAndSetCountsOnMount(): ${message}`);
  }
};

const isNotValidStoredCount = (obj: any) => !obj.alerts || !obj.currentlyCounting || !obj.id;

const parseDbCounts = (dbCounts: DbCount[]): Count[] => {
  return dbCounts.map(dbCount => ({
    ...dbCount,
    alerts: JSON.parse(dbCount.alerts)
  }));
};

export const useFetchAndSetCountsOnMount = () => {
  const db = useSQLiteContext();

  useEffect(() => {
    (async () => {
      try {
        const dbCounts = await db.getAllAsync<DbCount>(
          'SELECT * FROM savedCounts ORDER BY lastModified DESC'
        );

        const parsedDbCounts = parseDbCounts(dbCounts);
        const storedCount = await AsyncStorage.getItem('currentCount');

        if (!parsedDbCounts.length) {
          logMessage('No counts found in database.');

          if (!storedCount) {
            logMessage('No stored count found in AsyncStorage.');
            countsVar([buildNewCount()]);
            return;
          }

          logMessage('Found stored count in AsyncStorage', storedCount);
          const parsedStoredCount = JSON.parse(storedCount);
          return isNotValidStoredCount(parsedStoredCount)
            ? countsVar([buildNewCount()])
            : countsVar([parsedStoredCount]);
        }

        const dbCurrentlyCountingCount = parsedDbCounts.find(c => c.currentlyCounting);
        if (!dbCurrentlyCountingCount && storedCount) {
          logMessage(
            'No currentlyCounting count in DB, but found stored count in AsyncStorage.',
            storedCount
          );

          const parsedStoredCount = JSON.parse(storedCount);
          return isNotValidStoredCount(parsedStoredCount)
            ? countsVar([buildNewCount(), ...parsedDbCounts])
            : countsVar([parsedStoredCount, ...parsedDbCounts]);
        }

        if (!dbCurrentlyCountingCount && !storedCount) {
          logMessage(
            'No currentlyCounting count in DB, and no stored count in AsyncStorage. Setting most recently modified DB count to currentlyCounting.'
          );

          const mostRecentDbCount = parsedDbCounts[0];
          const updatedMostRecentDbCount: Count = {
            ...mostRecentDbCount,
            currentlyCounting: 1
          };

          const otherDbCounts = parsedDbCounts.slice(1);

          try {
            await db.runAsync(`UPDATE savedCounts SET currentlyCounting = ?, WHERE id = ?`, [
              1,
              updatedMostRecentDbCount.id
            ]);

            logMessage(
              'Updated most recently modified DB count to currentlyCounting true in DB.',
              updatedMostRecentDbCount
            );
          } catch (e) {
            console.error('useFetchAndSetCountsOnMount() Error updating DB: ', e);
          }

          countsVar([updatedMostRecentDbCount, ...otherDbCounts]);
          return;
        }

        if (parsedDbCounts.filter(c => c.currentlyCounting).length > 1) {
          console.error(
            'useFetchAndSetCountsOnMount(): More than one DB Count has currentlyCounting true. Setting second most recently modified one to currentlyCounting false.'
          );

          const updatedCount = { ...parsedDbCounts[1], currentlyCounting: 0 as const };

          try {
            await db.runAsync(`UPDATE savedCounts SET currentlyCounting = ?, WHERE id = ?`, [
              0,
              updatedCount.id
            ]);

            logMessage('Updated second most recently modified count to currentlyCounting false.');
          } catch (e) {
            console.error('useFetchAndSetCountsOnMount() Error updating DB: ', e);
          }

          const updatedCounts = parsedDbCounts.map(c =>
            c.id === updatedCount.id ? updatedCount : c
          );

          countsVar(updatedCounts);
          return;
        }

        countsVar(parsedDbCounts);
      } catch (e) {
        console.error('Error fetching current Count from database: ', e);
      }
    })();
  }, [db]);
};
