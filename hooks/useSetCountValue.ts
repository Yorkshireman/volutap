import { countVar } from '../reactiveVars';
import { useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

export const useSetCountValue = () => {
  const db = useSQLiteContext();

  const setCount = useCallback(
    async (desiredValue: number) => {
      const count = countVar();
      const initialValue = count.value;
      countVar({ ...count, value: desiredValue });

      if (!count.id) return;

      try {
        await db.runAsync('UPDATE savedCounts SET value = ?, lastModified = ? WHERE id = ?', [
          count.value,
          new Date().toISOString(),
          count.id
        ]);
      } catch (e) {
        console.error('useSetCountValue(): Error updating count in database: ', e);
        const latestCount = countVar();
        if (latestCount.value !== desiredValue) return;
        countVar({ ...latestCount, value: initialValue });
        console.error(`Rolled back count state to ${initialValue}.`);
      }
    },
    [db]
  );

  return setCount;
};
