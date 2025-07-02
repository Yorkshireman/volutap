import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';

export const usePersistCurrentCountAndId = (count: number, currentCountId: string | null) => {
  const db = useSQLiteContext();
  const currentCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (currentCountRef.current === count) {
      console.log('Count has not changed, skipping persistence.');
      return;
    }

    const saveCountToDB = async () => {
      try {
        if (currentCountId) {
          const result = await db.getFirstAsync<{ count: number }>(
            'SELECT count FROM savedCounts WHERE id = ?',
            [currentCountId]
          );

          const currentCount = result?.count || 0;
          if (currentCount === count) {
            console.log('Count in DB is already up to date, skipping update.');
            return;
          }

          console.log(`Updating savedCount in DB with id: ${currentCountId}, new count: ${count}.`);
          const now = new Date().toISOString();

          await db.runAsync('UPDATE savedCounts SET count = ?, lastModified = ? WHERE id = ?', [
            count,
            now,
            currentCountId
          ]);

          currentCountRef.current = count;
        }
      } catch (error) {
        console.error('Error updating count in database: ', error);
      }
    };

    AsyncStorage.setItem('currentCount', count.toString());
    saveCountToDB();
  }, [count, currentCountId, db]);

  useEffect(() => {
    if (!currentCountId) return;
    console.log('Persisting currentCountId: ', currentCountId);
    AsyncStorage.setItem('currentCountId', currentCountId ?? '');
  }, [currentCountId]);
};
