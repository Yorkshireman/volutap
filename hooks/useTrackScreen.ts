import { convertMsToSecs } from '../utils';
import { Screens } from '../types';
import { track } from '@amplitude/analytics-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';

export const useTrackScreen = (screenName: Screens) => {
  const startedAt = useRef<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      startedAt.current = Date.now();
      track('screen_view', { screen_name: screenName });

      return () => {
        const duration: number | undefined = startedAt.current
          ? convertMsToSecs(Date.now() - startedAt.current)
          : undefined;

        track('screen_hide', { duration_seconds: duration, screen_name: screenName });
        startedAt.current = null;
      };
    }, [screenName])
  );
};
