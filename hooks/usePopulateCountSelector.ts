import type { Count } from '../types';
import { savedCountsVar } from '../reactiveVars';
import { SQLiteDatabase } from 'expo-sqlite';
import { useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';

export const usePopulateCountSelector = (
  count: Count,
  db: SQLiteDatabase,
  setCounts: React.Dispatch<React.SetStateAction<Count[] | undefined>>
) => {
  const savedCounts = useReactiveVar(savedCountsVar);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const savedCounts: Count[] = await db.getAllAsync(
          'SELECT * FROM savedCounts ORDER BY lastModified DESC'
        );

        setCounts(savedCounts);
      } catch (error) {
        console.error('Error fetching counts:', error);
        return;
      }
    };

    fetchCounts();
  }, [count, db, savedCounts, setCounts]);
};
