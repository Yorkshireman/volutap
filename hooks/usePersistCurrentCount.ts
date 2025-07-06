import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Count } from '../types';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';

export const usePersistCurrentCount = (count: Count, currentCountId?: string) => {
  const db = useSQLiteContext();
  const currentCountValueRef = useRef<number | null>(null);
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    if (currentCountValueRef.current === count.value) return;

    const saveCountToDB = async () => {
      if (!currentCountId) return;

      try {
        const { value: currentCountDBvalue } =
          (await db.getFirstAsync<Count>('SELECT value FROM savedCounts WHERE id = ?', [
            currentCountId
          ])) || {};

        if (currentCountDBvalue === count.value) return;

        await db.runAsync('UPDATE savedCounts SET value = ?, lastModified = ? WHERE id = ?', [
          count.value,
          new Date().toISOString(),
          currentCountId
        ]);

        currentCountValueRef.current = count.value;
      } catch (error) {
        console.error('usePersistCurrentCountAndId(): Error updating count in database: ', error);
      }
    };

    AsyncStorage.setItem('currentCount', JSON.stringify(count));
    saveCountToDB();
  }, [count, currentCountId, db]);
};
