import { countVar } from '../reactiveVars';
import { useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';

export const useSetCountValue = () => {
  const db = useSQLiteContext();

  return useCallback(
    async (desiredValue: number) => {
      const count = countVar();
      const initialValue = count.value;
      const now = new Date().toISOString();
      countVar({ ...count, lastModified: now, value: desiredValue });

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
};
