import { CountingModeContext } from '../contexts';
import { countVar } from '../reactiveVars';
import { useAudioPlayer } from 'expo-audio';
import { useReactiveVar } from '@apollo/client';
import { useSetCountOnVolumeChange } from './useSetCountOnVolumeChange';
import { type Alert, AlertType } from '../types';
import { useContext, useEffect } from 'react';

const audioSource = require('../assets/beep-alarm-366507.mp3');

export const usePlaySound = (triggeredAlert: Alert | null) => {
  const count = useReactiveVar(countVar);
  const { countingWithVolumeButtons } = useContext(CountingModeContext);
  const { restartSilentSound } = useSetCountOnVolumeChange(countingWithVolumeButtons);

  const player = useAudioPlayer(audioSource);

  useEffect(() => {
    if (
      triggeredAlert &&
      count.value === triggeredAlert.at &&
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
  }, [count, countingWithVolumeButtons, restartSilentSound, triggeredAlert, player]);
};
