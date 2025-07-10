import { useEffect } from 'react';
import { Vibration } from 'react-native';
import { Alert, AlertType } from '../types';

export const useVibrate = (triggeredAlert: Alert | null) => {
  useEffect(() => {
    if (
      triggeredAlert &&
      (triggeredAlert.type === AlertType.VIBRATE ||
        triggeredAlert.type === AlertType.SOUND_AND_VIBRATE)
    ) {
      Vibration.vibrate();
      Vibration.vibrate([500], true);
    }

    return () => Vibration.cancel();
  }, [triggeredAlert]);
};
