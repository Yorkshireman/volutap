import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { VolumeManager } from 'react-native-volume-manager';
import { useEffect, useRef, useState } from 'react';

export const useSetCountOnVolumeChange = () => {
  const [count, setCount] = useState(0);
  const countRef = useRef(count);
  const didMount = useRef(false);
  const programmaticVolumeChangeRef = useRef(false);

  useEffect(() => {
    let sub: { remove: () => void } | null = null;
    let soundObj: Audio.Sound | null = null;

    (async () => {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: false
      });

      const { sound } = await Audio.Sound.createAsync(require('../assets/silent.mp3'), {
        isLooping: true,
        shouldPlay: true,
        volume: 0
      });

      soundObj = sound;

      VolumeManager.showNativeVolumeUI({ enabled: false });

      // Set volume so it's not at 0 (so can be changed up or down)
      await VolumeManager.setVolume(0.5);

      sub = VolumeManager.addVolumeListener(async ({ volume }) => {
        if (programmaticVolumeChangeRef.current) {
          programmaticVolumeChangeRef.current = false;
          return;
        }

        if (volume > 0.5) {
          setCount(c => c + 1);
        } else if (volume < 0.5) {
          if (countRef.current === 0) {
            programmaticVolumeChangeRef.current = true;
            await VolumeManager.setVolume(0.5);
            return;
          }

          setCount(c => c - 1);
        }
      });
    })();

    return () => {
      sub?.remove();
      soundObj?.unloadAsync();
    };
  }, []);

  useEffect(() => {
    countRef.current = count;
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const resetVolume = async () => {
      programmaticVolumeChangeRef.current = true;
      await VolumeManager.setVolume(0.5);
    };

    resetVolume();
  }, [count]);

  return { count, setCount };
};
