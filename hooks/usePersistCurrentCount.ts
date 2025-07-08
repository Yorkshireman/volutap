import AsyncStorage from '@react-native-async-storage/async-storage';
import { countVar } from '../reactiveVars';
import type { DbCount } from '../types';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';

export const usePersistCurrentCount = () => {
  const count = useReactiveVar(countVar);
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
      if (!count.id) return;

      try {
        const { value: currentCountDBvalue } =
          (await db.getFirstAsync<DbCount>('SELECT value FROM savedCounts WHERE id = ?', [
            count.id
          ])) || {};

        if (currentCountDBvalue === count.value) return;

        await db.runAsync('UPDATE savedCounts SET value = ?, lastModified = ? WHERE id = ?', [
          count.value,
          new Date().toISOString(),
          count.id
        ]);

        currentCountValueRef.current = count.value;
      } catch (error) {
        console.error('usePersistCurrentCountAndId(): Error updating count in database: ', error);
      }
    };

    AsyncStorage.setItem('currentCount', JSON.stringify(count));
    saveCountToDB();
  }, [count, db]);
};
