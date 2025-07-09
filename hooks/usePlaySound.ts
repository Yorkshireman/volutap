import { CountingModeContext } from '../contexts';
import { useAudioPlayer } from 'expo-audio';
import { useSetCountOnVolumeChange } from './useSetCountOnVolumeChange';
import { type Alert, AlertType } from '../types';
import { useContext, useEffect } from 'react';

const audioSource = require('../assets/beep-alarm-366507.mp3');

export const usePlaySound = (triggeredAlert: Alert | null) => {
  const { countingWithVolumeButtons } = useContext(CountingModeContext);
  const { restartSilentSound } = useSetCountOnVolumeChange(countingWithVolumeButtons);

  const player = useAudioPlayer(audioSource);

  useEffect(() => {
    if (
      triggeredAlert &&
      (triggeredAlert.type === AlertType.SOUND ||
        triggeredAlert.type === AlertType.SOUND_AND_VIBRATE)
    ) {
      player.seekTo(0);
      player.play();
      player.addListener('playbackStatusUpdate', status => {
        if (status.isLoaded && status.didJustFinish) {
          countingWithVolumeButtons && restartSilentSound();
        }
      });

      return;
    }
  }, [countingWithVolumeButtons, restartSilentSound, triggeredAlert, player]);
};
