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
      // every 500ms for 10 seconds
      // to loop indefinitely: Vibration.vibrate([500], true);
      Vibration.vibrate(Array(20).fill(500));
    }

    return () => Vibration.cancel();
  }, [triggeredAlert]);
};
