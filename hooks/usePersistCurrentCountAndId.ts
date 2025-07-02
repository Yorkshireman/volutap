import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

export const usePersistCurrentCountAndId = (count: number, currentCountId: string | null) => {
  const db = useSQLiteContext();
  useEffect(() => {
    const persistCount = async () => {
      try {
        if (currentCountId) {
          console.log(`Updating savedCount in DB with id: ${currentCountId}, new count: ${count}.`);
          const now = new Date().toISOString();
          await db.runAsync('UPDATE savedCounts SET count = ?, lastModified = ? WHERE id = ?', [
            count,
            now,
            currentCountId
          ]);
        }
      } catch (error) {
        console.error('Error updating count in database: ', error);
      }
    };

    AsyncStorage.setItem('currentCountId', currentCountId ?? '');
    AsyncStorage.setItem('currentCount', count.toString());
    persistCount();
  }, [count, currentCountId, db]);
};
