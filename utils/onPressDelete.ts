import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { buildNewCount } from './buildNewCount';
import type { ReactiveVar } from '@apollo/client';
import { sanitiseCountForTracking } from './sanitiseCountForTracking';
import { SQLiteDatabase } from 'expo-sqlite';
import { track } from '@amplitude/analytics-react-native';
import { Count, Screens, SetShowOptionsMenu, TrackingEventNames } from '../types';

export const onPressDelete = ({
  count,
  countsVar,
  db,
  screen,
  setShowOptionsMenu,
  source
}: {
  count: Count;
  countsVar: ReactiveVar<Count[]>;
  db: SQLiteDatabase;
  screen: Screens;
  setShowOptionsMenu: SetShowOptionsMenu;
  source: string;
}) => {
  setShowOptionsMenu(false);
  Alert.alert(
    `Delete ${count.title}`,
    'Are you sure? This cannot be undone.',
    [
      {
        style: 'cancel',
        text: 'Cancel'
      },
      {
        onPress: async () => {
          if (!count.id) {
            console.warn('onPressDelete(): Count id is falsey.');
            track(TrackingEventNames.WARNING, {
              message: 'onPressDelete(): Count id is falsey.',
              screen,
              source
            });

            return;
          }

          try {
            await db.runAsync('DELETE FROM savedCounts WHERE id = ?', [count.id]);
          } catch (error) {
            console.error('Error deleting count from database: ', error);
            Alert.alert('Error', 'Failed to delete the count. Please try again later.');
            track(TrackingEventNames.ERROR, {
              error,
              message: 'onPressDelete(): Error deleting count from database.',
              screen,
              source
            });

            return;
          }

          const updatedCounts = [buildNewCount(), ...countsVar().filter(c => c.id !== count.id)];
          countsVar(updatedCounts);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          track(TrackingEventNames.COUNT_DELETED, {
            count: sanitiseCountForTracking(count),
            screen,
            source
          });
        },
        style: 'destructive',
        text: 'Delete'
      }
    ],
    { cancelable: true }
  );
};
