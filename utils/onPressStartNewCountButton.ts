import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { buildNewCount } from './buildNewCount';
import type { ReactiveVar } from '@apollo/client';
import { sanitiseCountForTracking } from './sanitiseCountForTracking';
import { SQLiteDatabase } from 'expo-sqlite';
import { track } from '../utils';
import { Count, Screens, TrackingEventNames } from '../types';

export const onPressStartNewCountButton = ({
  count,
  countsVar,
  db,
  screen,
  source
}: {
  count: Count;
  countsVar: ReactiveVar<Count[]>;
  db: SQLiteDatabase;
  screen?: Screens;
  source?: string;
}) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  Alert.alert(
    'Start New Count',
    'Are you sure?',
    [
      {
        style: 'cancel',
        text: 'Cancel'
      },
      {
        onPress: async () => {
          if (!count.id) return;
          const originalCounts = countsVar();

          try {
            await db.runAsync('UPDATE savedCounts SET currentlyCounting = ? WHERE id = ?', [
              0,
              count.id
            ]);

            const newCount = buildNewCount();
            countsVar([
              newCount,
              ...originalCounts.map(c => ({ ...c, currentlyCounting: 0 as const }))
            ]);

            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            track(
              TrackingEventNames.NEW_COUNT_STARTED,
              {
                count: sanitiseCountForTracking(newCount),
                oldCount: sanitiseCountForTracking(count),
                screen,
                source
              },
              'onPressStartNewCountButton.ts'
            );
          } catch (error) {
            console.error('Error updating currentlyCounting in database: ', error);
            countsVar(originalCounts);
            track(
              TrackingEventNames.ERROR,
              {
                count,
                error,
                message:
                  'onPressStartNewCountButton(): Error updating currentlyCounting in database.',
                screen,
                source
              },
              'onPressStartNewCountButton.ts'
            );
          }
        },
        text: 'OK'
      }
    ],
    { cancelable: true }
  );
};
