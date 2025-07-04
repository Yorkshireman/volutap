import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { Count, SetCount } from '../types';

export const useFetchAndSetCurrentCountAndIdOnMount = (setCount: SetCount) => {
  const db = useSQLiteContext();
  useEffect(() => {
    (async () => {
      let currentCount: Count | null;
      try {
        console.log(
          'useFetchAndSetCurrentCountAndIdOnMount(): Querying DB for a Count that has currentlyCounting true.'
        );

        currentCount = await db.getFirstAsync<Count>(
          'SELECT * FROM savedCounts WHERE currentlyCounting = ?',
          [true]
        );

        if (!currentCount) {
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
          setCount(parsedStoredCount);
          return;
        }

        console.log(
          'useFetchAndSetCurrentCountAndIdOnMount(): Current count found in database: ',
          JSON.stringify(currentCount)
        );

        setCount(currentCount);
      } catch (e) {
        console.error('Error fetching current Count from database: ', e);
      }
    })();
  }, [db, setCount]);
};
