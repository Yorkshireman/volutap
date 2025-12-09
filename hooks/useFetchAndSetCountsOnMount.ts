import AsyncStorage from '@react-native-async-storage/async-storage';
import { countsVar } from '../reactiveVars';
import { useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import uuid from 'react-native-uuid';
import type { Count, DbCount } from '../types';

const buildNewCount = (): Count => ({
  alerts: [],
  currentlyCounting: true,
  id: uuid.v4(),
  saved: false,
  value: 0
});

const logMessage = (message: string, data?: any) => {
  if (data) {
    console.log(`useFetchAndSetCountsOnMount(): ${message}: `, data);
  } else {
    console.log(`useFetchAndSetCountsOnMount(): ${message}`);
  }
};

const isNotValidStoredCount = (obj: any) => !obj.alerts || !obj.currentlyCounting || !obj.id;

export const useFetchAndSetCountsOnMount = () => {
  const db = useSQLiteContext();

  useEffect(() => {
    (async () => {
      try {
        const dbCounts = await db.getAllAsync<DbCount>('SELECT * FROM savedCounts');

        if (!dbCounts.length) {
          logMessage('No counts found in database.');
          const storedCount = await AsyncStorage.getItem('currentCount');

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

        // counts in db but none currentlyCounting
        // counts in db and more than one is currentlyCounting (throw error)
        // counts in db and one is currentlyCounting

        // console.log(
        //   'useFetchAndSetCurrentCountAndIdOnMount(): Querying DB for a Count that has currentlyCounting true.'
        // );

        // const dbCurrentlyCountingCount = await db.getFirstAsync<DbCount>(
        //   'SELECT * FROM savedCounts WHERE currentlyCounting = ?',
        //   [true]
        // );

        // if (!dbCurrentlyCountingCount) {
        //   console.log(
        //     'useFetchAndSetCurrentCountAndIdOnMount(): No current count found in database, building using AsyncStorage count value.'
        //   );

        //   const storedCount = await AsyncStorage.getItem('currentCount');
        //   if (!storedCount) {
        //     console.log(
        //       'useFetchAndSetCurrentCountAndIdOnMount(): No stored count found in AsyncStorage.'
        //     );

        //     return;
        //   }

        //   console.log(
        //     'useFetchAndSetCurrentCountAndIdOnMount(): Stored count from AsyncStorage: ',
        //     storedCount
        //   );

        //   const parsedStoredCount: Count = storedCount ? JSON.parse(storedCount) : null;
        //   countVar(parsedStoredCount);
        //   return;
        // }

        // console.log(
        //   'useFetchAndSetCurrentCountAndIdOnMount(): Current count found in database: ',
        //   JSON.stringify(dbCurrentlyCountingCount)
        // );

        // const alerts = JSON.parse(dbCurrentlyCountingCount.alerts);
        // countVar({ ...dbCurrentlyCountingCount, alerts });
      } catch (e) {
        console.error('Error fetching current Count from database: ', e);
      }
    })();
  }, [db]);
};
