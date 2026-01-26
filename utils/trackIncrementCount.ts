import { sanitiseCountForTracking } from './sanitiseCountForTracking';
import { track } from '@amplitude/analytics-react-native';
import { Count, CountValueChangeSource, Screens } from '../types';

export const trackIncrementCount = (
  originalCount: Count,
  updatedCount: Count,
  screen: Screens,
  source: CountValueChangeSource
) => {
  try {
    let direction: string;
    if (originalCount.value < updatedCount.value) {
      direction = 'up';
    } else if (originalCount.value > updatedCount.value) {
      direction = 'down';
    } else {
      return;
    }

    track('count_value_changed', {
      count: { ...sanitiseCountForTracking(updatedCount), previousValue: originalCount.value },
      direction,
      screen,
      source
    });
  } catch (e) {
    console.warn('trackIncrementCount.ts, track failed: ', e);
  }
};
