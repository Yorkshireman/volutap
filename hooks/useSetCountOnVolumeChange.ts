import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import type { Count } from '../types';
import { useReactiveVar } from '@apollo/client';
import { VolumeManager } from 'react-native-volume-manager';
import { countVar, disableVolumeButtonCountingVar } from '../reactiveVars';
import { useEffect, useRef } from 'react';

export const useSetCountOnVolumeChange = (countingWithVolumeButtons: boolean) => {
  const count = useReactiveVar(countVar);
  const countValueRef = useRef<Count['value']>(count.value);
  const didMount = useRef(false);
  const justSwitchedMode = useRef(false);
  const programmaticVolumeChangeRef = useRef(false);
  const silentSoundRef = useRef<Audio.Sound | null>(null);

  const startSilentSound = async () => {
    if (silentSoundRef.current) {
      await silentSoundRef.current.unloadAsync();
    }

    const { sound } = await Audio.Sound.createAsync(require('../assets/silent.mp3'), {
      isLooping: true,
      shouldPlay: true,
      volume: 0
    });

    silentSoundRef.current = sound;
  };

  useEffect(() => {
    let sub: { remove: () => void } | null = null;

    if (countingWithVolumeButtons) {
      justSwitchedMode.current = true;

      (async () => {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: false
        });

        await startSilentSound();

        VolumeManager.showNativeVolumeUI({ enabled: false });

        // Set volume so it's not at 0 (so can be changed up or down)
        await VolumeManager.setVolume(0.5);

        sub = VolumeManager.addVolumeListener(async ({ volume }) => {
          if (programmaticVolumeChangeRef.current) {
            programmaticVolumeChangeRef.current = false;
            return;
          }

          const disableVolumeButtonCounting = disableVolumeButtonCountingVar();
          if (volume > 0.5) {
            const current = countVar();
            !disableVolumeButtonCounting && countVar({ ...current, value: current.value + 1 });
          } else if (volume < 0.5) {
            if (countValueRef.current === 0) {
              programmaticVolumeChangeRef.current = true;
              await VolumeManager.setVolume(0.5);
              return;
            }

            const current = countVar();
            !disableVolumeButtonCounting && countVar({ ...current, value: current.value - 1 });
          }
        });
      })();
    }

    return () => {
      silentSoundRef.current?.unloadAsync();
      sub?.remove();
    };
  }, [countingWithVolumeButtons]);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    if (!countingWithVolumeButtons) return;

    if (justSwitchedMode.current) {
      justSwitchedMode.current = false;
      return;
    }

    countValueRef.current = count.value;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const resetVolume = async () => {
      programmaticVolumeChangeRef.current = true;
      await VolumeManager.setVolume(0.5);
    };

    resetVolume();
  }, [count, countingWithVolumeButtons]);

  return { restartSilentSound: startSilentSound };
};
