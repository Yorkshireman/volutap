import AsyncStorage from '@react-native-async-storage/async-storage';
import { countVar } from '../reactiveVars';
import { useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { Count, DbCount } from '../types';

export const useFetchAndSetCurrentCountAndIdOnMount = () => {
  const db = useSQLiteContext();

  useEffect(() => {
    (async () => {
      try {
        console.log(
          'useFetchAndSetCurrentCountAndIdOnMount(): Querying DB for a Count that has currentlyCounting true.'
        );

        const dbCurrentlyCountingCount = await db.getFirstAsync<DbCount>(
          'SELECT * FROM savedCounts WHERE currentlyCounting = ?',
          [true]
        );

        if (!dbCurrentlyCountingCount) {
          console.log(
            'useFetchAndSetCurrentCountAndIdOnMount(): No current count found in database, building using AsyncStorage count value.'
          );

          const storedCount = await AsyncStorage.getItem('currentCount');
          if (!storedCount) {
            console.log(
              'useFetchAndSetCurrentCountAndIdOnMount(): No stored count found in AsyncStorage.'
            );

            return;
          }

          console.log(
            'useFetchAndSetCurrentCountAndIdOnMount(): Stored count from AsyncStorage: ',
            storedCount
          );

          const parsedStoredCount: Count = storedCount ? JSON.parse(storedCount) : null;
          countVar(parsedStoredCount);
          return;
        }

        console.log(
          'useFetchAndSetCurrentCountAndIdOnMount(): Current count found in database: ',
          JSON.stringify(dbCurrentlyCountingCount)
        );

        const alerts = JSON.parse(dbCurrentlyCountingCount.alerts);
        countVar({ ...dbCurrentlyCountingCount, alerts });
      } catch (e) {
        console.error('Error fetching current Count from database: ', e);
      }
    })();
  }, [db]);
};
