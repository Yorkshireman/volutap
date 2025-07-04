import type { Count } from '../types';
import { SQLiteDatabase } from 'expo-sqlite';
import { useEffect } from 'react';

export const usePopulateCountSelector = (
  count: Count,
  db: SQLiteDatabase,
  setCounts: React.Dispatch<React.SetStateAction<Count[] | undefined>>,
  setSelectedCount: React.Dispatch<React.SetStateAction<Count | null>>
) => {
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const result: Count[] = await db.getAllAsync(
          'SELECT * FROM savedCounts ORDER BY lastModified DESC'
        );

        const currentlyCounting = result.find(count => count.currentlyCounting);
        setSelectedCount(currentlyCounting || null);
        setCounts(result.filter(({ id }) => id !== currentlyCounting?.id));
      } catch (error) {
        console.error('Error fetching counts:', error);
        return;
      }
    };

    fetchCounts();
  }, [count, db, setCounts, setSelectedCount]);
};
