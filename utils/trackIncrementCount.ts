import { sanitiseCountForTracking } from './sanitiseCountForTracking';
import { track } from '@amplitude/analytics-react-native';
import type { Count, Screens } from '../types';

export const trackIncrementCount = (originalCount: Count, updatedCount: Count, screen: Screens) => {
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
      screen,
      source
    });
  } catch (e) {
    console.warn('trackIncrementCount.ts, track failed: ', e);
  }
};
