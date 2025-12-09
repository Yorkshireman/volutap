import type { Count } from '../types';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
import { countVar, savedCountsVar } from '../reactiveVars';
import { useEffect, useRef } from 'react';

const countIsMissingRequiredFields = (count: Count): boolean => {
  return (
    !count.alerts ||
    !count.createdAt ||
    count.currentlyCounting === undefined ||
    !count.id ||
    !count.lastModified ||
    !count.title ||
    count.value === undefined
  );
};

export const useUpdateSavedCountOnCountChange = () => {
  const count = useReactiveVar(countVar);
  const db = useSQLiteContext();
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    if (!count.id) return;

    async function updateCountInDB() {
      try {
        if (countIsMissingRequiredFields(count)) {
          console.warn('Count in state is missing required fields, not updating DB:', count);
          return;
        }

        await db.runAsync(
          `UPDATE savedCounts SET
            alerts = ?,
            createdAt = ?,
            currentlyCounting = ?,
            lastModified = ?,
            title = ?,
            value = ?
            WHERE id = ?`,
          [
            JSON.stringify(count.alerts),
            count.createdAt!,
            count.currentlyCounting!,
            count.lastModified!,
            count.title!,
            count.value,
            count.id!
          ]
        );

        console.log('useUpdateSavedCountOnCountChange(): Count updated in DB:', count);
        const prevCounts = savedCountsVar();
        if (prevCounts?.length) {
          savedCountsVar(
            prevCounts.map(savedCount => (savedCount.id === count.id ? count : savedCount))
          );
        }
      } catch (error) {
        console.error('Error updating count in DB:', error);
      }
    }

    updateCountInDB();
  }, [count, db]);
};
