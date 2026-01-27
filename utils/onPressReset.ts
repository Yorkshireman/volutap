import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { countChangeViaUserInteractionHasHappenedVar } from '../reactiveVars';
import type { ReactiveVar } from '@apollo/client';
import { sanitiseCountForTracking } from './sanitiseCountForTracking';
import { SQLiteDatabase } from 'expo-sqlite';
import { track } from '../utils';
import { updateCountInDb } from './updateCountInDb';
import { Count, Screens, TrackingEventNames } from '../types';

export const onPressReset = (count: Count, countsVar: ReactiveVar<Count[]>, db: SQLiteDatabase) => {
  if (count.value === 0) return;

  Alert.alert(
    'Reset',
    'Are you sure you want to reset the counter to zero?',
    [
      {
        style: 'cancel',
        text: 'Cancel'
      },
      {
        onPress: async () => {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          const counts = countsVar();
          const updatedCount: Count = {
            ...count,
            lastModified: new Date().toISOString(),
            value: 0
          };

          const updatedCounts = counts.map(c => (c.id === count.id ? updatedCount : c));

          const originalCounts = counts;
          countChangeViaUserInteractionHasHappenedVar(true);
          countsVar(updatedCounts);

          if (count.saved) {
            updateCountInDb({
              db,
              errorCallback: () => countsVar(originalCounts),
              successCallback: () => {
                try {
                  track(
                    TrackingEventNames.COUNT_RESET,
                    {
                      count: sanitiseCountForTracking(updatedCount),
                      screen: Screens.SINGLE,
                      source: 'button'
                    },
                    'onPressReset.ts'
                  );
                } catch (e) {
                  console.warn('onPressReset.ts, track failed: ', e);
                }
              },
              updatedCount
            });
          } else {
            track(
              TrackingEventNames.COUNT_RESET,
              {
                count: sanitiseCountForTracking(updatedCount),
                screen: Screens.SINGLE,
                source: 'button'
              },
              'onPressReset.ts'
            );
          }
        },
        text: 'OK'
      }
    ],
    { cancelable: true }
  );
};
