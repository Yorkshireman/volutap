import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import type { Count } from '../types';
import { updateCountInDb } from '../utils';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
import { VolumeManager } from 'react-native-volume-manager';
import {
  countChangeViaUserInteractionHasHappenedVar,
  countsVar,
  disableVolumeButtonCountingVar
} from '../reactiveVars';
import { useEffect, useRef } from 'react';

export const useSetCountOnVolumeChange = (countingWithVolumeButtons: boolean) => {
  const counts = useReactiveVar(countsVar);
  const countValueRef = useRef<Count['value']>(counts.find(c => c.currentlyCounting)?.value);
  const db = useSQLiteContext();
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

          const counts = countsVar();
          const disableVolumeButtonCounting = disableVolumeButtonCountingVar();

          if (volume > 0.5) {
            const current = counts.find(c => c.currentlyCounting)!;
            if (!disableVolumeButtonCounting) {
              const updatedCount: Count = {
                ...current,
                lastModified: new Date().toISOString(),
                value: current!.value + 1
              };

              const updatedCounts = counts
                .map(c => (c.id === current!.id ? updatedCount : c))
                .sort((a, b) => (a.lastModified > b.lastModified ? -1 : 1));

              const originalCounts = counts;
              countsVar(updatedCounts);
              updatedCount.saved &&
                updateCountInDb(updatedCount, db, () => countsVar(originalCounts));
              // change updateCountInDb() to accept a success callback, and pass countChangeViaUserInteractionHasHappenedVar(true) there
              countChangeViaUserInteractionHasHappenedVar(true);
            }
          } else if (volume < 0.5) {
            if (countValueRef.current === 0) {
              programmaticVolumeChangeRef.current = true;
              await VolumeManager.setVolume(0.5);
              return;
            }

            const current = counts.find(c => c.currentlyCounting)!;
            if (!disableVolumeButtonCounting) {
              const updatedCount: Count = {
                ...current,
                lastModified: new Date().toISOString(),
                value: current!.value - 1
              };

              const updatedCounts = counts
                .map(c => (c.id === current!.id ? updatedCount : c))
                .sort((a, b) => (a.lastModified > b.lastModified ? -1 : 1));

              const originalCounts = counts;
              countsVar(updatedCounts);
              updatedCount.saved &&
                updateCountInDb(updatedCount, db, () => countsVar(originalCounts));
              // change updateCountInDb() to accept a success callback, and pass countChangeViaUserInteractionHasHappenedVar(true) there
              countChangeViaUserInteractionHasHappenedVar(true);
            }
          }
        });
      })();
    }

    return () => {
      silentSoundRef.current?.unloadAsync();
      sub?.remove();
    };
  }, [countingWithVolumeButtons, db]);

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

    countValueRef.current = counts.find(c => c.currentlyCounting)?.value;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const resetVolume = async () => {
      programmaticVolumeChangeRef.current = true;
      await VolumeManager.setVolume(0.5);
    };

    resetVolume();
  }, [counts, countingWithVolumeButtons]);

  const setVolumeToMid = async () => {
    await VolumeManager.setVolume(0.5);
  };

  return { restartSilentSound: startSilentSound, setVolumeToMid };
};
