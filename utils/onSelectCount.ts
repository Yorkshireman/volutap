import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import { countChangeViaUserInteractionHasHappenedVar } from '../reactiveVars';
import type { ReactiveVar } from '@apollo/client';
import { sanitiseCountForTracking } from './sanitiseCountForTracking';
import { SQLiteDatabase } from 'expo-sqlite';
import { track } from '@amplitude/analytics-react-native';
import { updateCountInDb } from './updateCountInDb';
import {
  Count,
  Screens,
  SetDropdownVisible,
  SetShowSaveInputField,
  TrackingEventNames
} from '../types';

export const onSelectCount = async ({
  countsVar,
  db,
  selectedCountId,
  setDropdownVisible,
  setShowSaveInputField
}: {
  countsVar: ReactiveVar<Count[]>;
  db: SQLiteDatabase;
  selectedCountId: Count['id'];
  setDropdownVisible: SetDropdownVisible;
  setShowSaveInputField: SetShowSaveInputField;
}) => {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  const counts = countsVar();
  const selectedCount = counts.find(c => c.id === selectedCountId);

  if (!selectedCount) {
    console.error('onSelectCount(): No count found with the selected id.');
    return;
  }

  const currentCount = counts.find(c => c.currentlyCounting);

  if (!currentCount?.saved) {
    Alert.alert(
      'Save Current Count?',
      'You have a count in progress. Do you want to save it before switching?',
      [
        {
          onPress: async () => {
            const newSelectedCount = { ...selectedCount, currentlyCounting: 1 as const };
            const newCounts = counts
              .map(c => (c.id === selectedCount?.id ? newSelectedCount : c))
              .filter(c => c.id !== currentCount?.id);

            await updateCountInDb({ db, updatedCount: newSelectedCount });
            countChangeViaUserInteractionHasHappenedVar(false);
            countsVar(newCounts);
            setDropdownVisible(false);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            track(TrackingEventNames.SWITCHED_COUNT, {
              oldCount: currentCount ? sanitiseCountForTracking(currentCount) : undefined,
              screen: Screens.SINGLE,
              selectedCount: sanitiseCountForTracking(newSelectedCount)
            });
          },
          text: 'Proceed Without Saving'
        },
        {
          onPress: () => {
            setShowSaveInputField(true);
          },
          style: 'cancel',
          text: 'Save'
        }
      ]
    );

    return;
  }

  const newCurrentCount = { ...currentCount, currentlyCounting: 0 as const };

  const successCallback = () => {
    const newCounts = counts.map(c => (c.id === currentCount.id ? newCurrentCount : c));
    countsVar(newCounts);
  };

  await updateCountInDb({
    db,
    errorCallback: () => countsVar(counts),
    successCallback,
    updatedCount: newCurrentCount
  });

  setDropdownVisible(false);

  const currentCountsAfterFirstUpdate = countsVar();
  const newSelectedCount = { ...selectedCount, currentlyCounting: 1 as const };

  const successCallbackSecondUpdate = () => {
    const newCounts = countsVar().map(c => (c.id === selectedCount.id ? newSelectedCount : c));
    countChangeViaUserInteractionHasHappenedVar(false);
    countsVar(newCounts);
    track(TrackingEventNames.SWITCHED_COUNT, {
      oldCount: currentCount ? sanitiseCountForTracking(currentCount) : undefined,
      screen: Screens.SINGLE,
      selectedCount: sanitiseCountForTracking(newSelectedCount)
    });
  };

  await updateCountInDb({
    db,
    errorCallback: () => countsVar(currentCountsAfterFirstUpdate),
    successCallback: successCallbackSecondUpdate,
    updatedCount: newSelectedCount
  });
};
