import Constants from 'expo-constants';
import { init, logEvent, Types } from '@amplitude/analytics-react-native';

const amplitudeApiKey = Constants.expoConfig?.extra?.AMPLITUDE_API_KEY;

export const setupAnalytics = () => {
  if (!amplitudeApiKey) {
    console.warn('setupAnalytics(): missing amplitudeApiKey - analytics disabled.');
  }

  try {
    init(amplitudeApiKey, undefined, {
      appVersion: '1.0.0',
      disableCookies: true,
      logLevel: Types.LogLevel.Verbose,
      serverZone: 'EU',
      sessionTimeout: 10 * 60 * 1000, // 10 minutes,
      trackingSessionEvents: true
    });

    logEvent('app_open');
  } catch (e) {
    console.warn('setupAnalytics(): init failed', e);
  }
};
