import * as StoreReview from 'expo-store-review';
import { track } from './track';
import { TrackingEventNames } from '../types';

export const promptForRating = async ({
  consumer,
  source
}: {
  consumer: string;
  source?: string;
}) => {
  if (await StoreReview.isAvailableAsync()) {
    // This may or may not actually show the prompt (Apple limits frequency to ~3 per year)
    await StoreReview.requestReview();
  } else {
    track(TrackingEventNames.APP_STORE_REVIEW_PROMPT_NOT_AVAILABLE, { source }, consumer);
  }
};
