import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Count } from '../types';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';

export const usePersistCurrentCountAndId = (count: Count, currentCountId?: string) => {
  //rename
  const db = useSQLiteContext();
  const currentCountValueRef = useRef<number | null>(null);
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    if (currentCountValueRef.current === count.value) {
      console.log('usePersistCurrentCountAndId(): Count has not changed, skipping persistence.');
      return;
    }

    const saveCountToDB = async () => {
      if (!currentCountId) return;

      try {
        const result = await db.getFirstAsync<{ count: number }>(
          'SELECT count FROM savedCounts WHERE id = ?',
          [currentCountId]
        );

        const currentCount = result?.count || 0;
        if (currentCount === count.value) {
          console.log(
            'usePersistCurrentCountAndId(): Count in DB is already up to date, skipping update.'
          );

          return;
        }

        console.log(
          `usePersistCurrentCountAndId(): Updating savedCount in DB with id: ${currentCountId}, new count: ${JSON.stringify(
            count
          )}.`
        );

        await db.runAsync('UPDATE savedCounts SET count = ?, lastModified = ? WHERE id = ?', [
          count.value,
          new Date().toISOString(),
          currentCountId
        ]);

        currentCountValueRef.current = count.value;
      } catch (error) {
        console.error('usePersistCurrentCountAndId(): Error updating count in database: ', error);
      }
    };

    console.log(
      'usePersistCurrentCountAndId(): Persisting Count to AsyncStorage: ',
      JSON.stringify(count)
    );

    AsyncStorage.setItem('currentCount', JSON.stringify(count));
    saveCountToDB();
  }, [count, currentCountId, db]);
};
