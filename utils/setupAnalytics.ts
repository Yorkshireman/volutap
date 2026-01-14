import Constants from 'expo-constants';
import { init, logEvent, Types } from '@amplitude/analytics-react-native';

const amplitudeApiKey = Constants.expoConfig?.extra?.AMPLITUDE_API_KEY;

export const setupAnalytics = () => {
  if (!amplitudeApiKey) {
    console.warn('setupAnalytics(): missing amplitudeApiKey - analytics disabled.');
  }

  init(amplitudeApiKey, undefined, {
    disableCookies: true,
    logLevel: Types.LogLevel.Verbose,
    serverZone: 'EU'
  });

  logEvent('app_open');
};
