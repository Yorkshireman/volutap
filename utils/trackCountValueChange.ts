import { sanitiseCountForTracking } from './sanitiseCountForTracking';
import { track } from '@amplitude/analytics-react-native';
import { Count, CountValueChangeSource, Screens, TrackingEventNames } from '../types';

export const trackCountValueChange = ({
  originalCount,
  updatedCount,
  screen,
  source
}: {
  originalCount: Count;
  updatedCount: Count;
  screen: Screens;
  source: CountValueChangeSource;
}) => {
  try {
    let direction: string;
    if (originalCount.value < updatedCount.value) {
      direction = 'up';
    } else if (originalCount.value > updatedCount.value) {
      direction = 'down';
    } else {
      return;
    }

    track(TrackingEventNames.COUNT_VALUE_CHANGED, {
      count: { ...sanitiseCountForTracking(updatedCount), previousValue: originalCount.value },
      direction,
      screen,
      source
    });
  } catch (e) {
    console.warn('trackCountValueChange.ts, track failed: ', e);
  }
};
