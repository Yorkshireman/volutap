import { savedCountsVar } from '../reactiveVars';
import { useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import type { DbCount, SavedCount } from '../types';

export const useFetchAndSetSavedCountsOnMount = () => {
  const db = useSQLiteContext();

  useEffect(() => {
    (async () => {
      try {
        console.log('useFetchAndSetSavedCountsOnMount(): Querying DB for saved counts.');

        const dbSavedCounts = await db.getAllAsync<DbCount>(
          'SELECT * FROM savedCounts ORDER BY createdAt DESC',
          [true]
        );

        if (!dbSavedCounts || !dbSavedCounts.length) {
          console.log('useFetchAndSetSavedCountsOnMount(): No saved counts found in DB.');

          return;
        }

        const parsedSavedCounts: SavedCount[] = dbSavedCounts.map(c => ({
          ...c,
          alerts: JSON.parse(c.alerts)
        }));

        savedCountsVar(parsedSavedCounts);
      } catch (e) {
        console.error('Error fetching saved counts from database: ', e);
      }
    })();
  }, [db]);
};
