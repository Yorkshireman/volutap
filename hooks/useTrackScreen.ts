import { convertMsToSecs } from '../utils';
import { track } from '@amplitude/analytics-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Screens, TrackingEventNames } from '../types';
import { useCallback, useRef } from 'react';

export const useTrackScreen = (screenName: Screens) => {
  const startedAt = useRef<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      startedAt.current = Date.now();
      track(TrackingEventNames.SCREEN_VIEWED, { screen_name: screenName });

      return () => {
        const duration: number | undefined = startedAt.current
          ? convertMsToSecs(Date.now() - startedAt.current)
          : undefined;

        track(TrackingEventNames.SCREEN_HIDDEN, {
          screen_name: screenName,
          viewed_for_duration_seconds: duration
        });

        startedAt.current = null;
      };
    }, [screenName])
  );
};
