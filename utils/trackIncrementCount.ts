import type { Count } from '../types';
import { sanitiseCountForTracking } from './santiseCountForTracking';
import { track } from '@amplitude/analytics-react-native';

export const trackIncrementCount = (originalCount: Count, updatedCount: Count) => {
  try {
    let direction: string;
    let source: string;
    if (originalCount.value < updatedCount.value) {
      direction = 'up';
      source = 'button';
    } else if (originalCount.value > updatedCount.value) {
      direction = 'down';
      source = 'button';
    } else {
      return;
    }

    track('count_changed', {
      ...sanitiseCountForTracking(updatedCount),
      direction,
      source
    });
  } catch (e) {
    console.warn('countingButtons.tsx, track failed: ', e);
  }
};
