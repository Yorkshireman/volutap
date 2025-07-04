import { SQLiteDatabase } from 'expo-sqlite';
import { transformDbCountToCount } from '../utils';
import { useEffect } from 'react';
import type { Count, DbCount } from '../types';

export const usePopulateCountSelector = (
  count: Count,
  db: SQLiteDatabase,
  setCounts: React.Dispatch<React.SetStateAction<Count[] | undefined>>,
  setSelectedCount: React.Dispatch<React.SetStateAction<Count | undefined>>
) => {
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const result: DbCount[] = await db.getAllAsync(
          'SELECT * FROM savedCounts ORDER BY lastModified DESC'
        );

        const currentlyCounting = result.find(count => count.currentlyCounting);
        if (!currentlyCounting) throw new Error('No currently counting count found');
        setSelectedCount(transformDbCountToCount(currentlyCounting));
        setCounts(
          result.map(transformDbCountToCount).filter(({ id }) => id !== currentlyCounting.id)
        );
      } catch (error) {
        console.error('Error fetching counts:', error);
        return;
      }
    };

    fetchCounts();
  }, [count, db, setCounts, setSelectedCount]);
};
