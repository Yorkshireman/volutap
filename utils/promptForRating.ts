import * as StoreReview from 'expo-store-review';
import { track } from './track';
import { Screens, TrackingEventNames } from '../types';

export const promptForRating = async ({
  consumer,
  screen
}: {
  consumer: string;
  screen?: Screens;
}) => {
  if (await StoreReview.isAvailableAsync()) {
    // This may or may not actually show the prompt (Apple limits frequency to ~3 per year)
    await StoreReview.requestReview();
  } else {
    track(TrackingEventNames.APP_STORE_REVIEW_PROMPT_NOT_AVAILABLE, { screen }, consumer);
  }
};
