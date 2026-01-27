import { track as _track } from '@amplitude/analytics-react-native';
import { TrackingEventNames } from '../types';

export const track = (
  eventName: TrackingEventNames,
  options: Record<string, any>,
  consumer: string
) => {
  try {
    _track(eventName, options);
  } catch (e) {
    console.warn(`${consumer}, track failed: `, e);
  }
};
