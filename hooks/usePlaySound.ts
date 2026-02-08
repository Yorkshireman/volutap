import { CountingModeContext } from '../contexts';
import { countsVar } from '../reactiveVars';
import { useAudioPlayer } from 'expo-audio';
import { useReactiveVar } from '@apollo/client';
import { useSetCountOnVolumeChange } from './useSetCountOnVolumeChange';
import { type Alert, AlertType } from '../types';
import { useContext, useEffect } from 'react';

const audioSource = require('../assets/beep-alarm-366507.mp3');

export const usePlaySound = (triggeredAlert: Alert | null) => {
  const counts = useReactiveVar(countsVar);
  const { countingWithVolumeButtons } = useContext(CountingModeContext);
  const { restartSilentSound } = useSetCountOnVolumeChange(countingWithVolumeButtons);

  const count = counts.find(c => c.currentlyCounting);
  const player = useAudioPlayer(audioSource);

  useEffect(() => {
    if (!count) return;
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
