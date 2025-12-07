import * as Haptics from 'expo-haptics';
import { useCallback } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { countVar, savedCountsVar } from '../reactiveVars';

export const useSetSavedCountValue = () => {
  const db = useSQLiteContext();

  return useCallback(
    async (desiredValue: number, id: string) => {
      const savedCounts = savedCountsVar();
      const singleCountScreenCountState = countVar();
      const count = savedCounts?.find(c => c.id === id);

      if (!count) {
        console.error(`useSetCountValue(): No count found with id ${id}`);
        return;
      }

      const initialLastModified = count.lastModified;
      const initialValue = count.value;
      const now = new Date().toISOString();

      const updatedSavedCounts = savedCounts?.map(savedCount =>
        savedCount.id === id
          ? { ...savedCount, lastModified: now, value: desiredValue }
          : savedCount
      );

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

      if (singleCountScreenCountState.id === id) {
        countVar({ ...singleCountScreenCountState, value: desiredValue });
      }

      savedCountsVar(updatedSavedCounts);

      try {
        await db.runAsync(`UPDATE savedCounts SET lastModified = ?, value = ? WHERE id = ?`, [
          now,
          desiredValue,
          id
        ]);

        console.log(
          'Count updated in DB: ',
          updatedSavedCounts?.find(c => c.id === id)
        );
      } catch (error) {
        console.error('Error incrementing count: ', error);
        const latestSavedCounts = savedCountsVar();

        if (latestSavedCounts?.find(c => c.id === id)?.value !== desiredValue) return;

        if (!initialValue) {
          console.error('No initial value found for rollback.');
          return;
        }

        savedCountsVar(
          latestSavedCounts.map(savedCount =>
            savedCount.id === id
              ? { ...savedCount, lastModified: initialLastModified, value: initialValue }
              : savedCount
          )
        );

        if (singleCountScreenCountState.id === id) {
          countVar({
            ...singleCountScreenCountState,
            lastModified: initialLastModified,
            value: initialValue
          });
        }

        console.error('Rolled back counts state due to error.');
      }
    },
    [db]
  );
};
