import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';
import type { Count } from './types';

export const onPressReset = (
  count: Count,
  setCount: React.Dispatch<React.SetStateAction<Count>>
) => {
  if (count.value === 0) return;

  Alert.alert(
    'Reset',
    'Are you sure you want to reset the counter to zero? This cannot be undone.',
    [
      {
        style: 'cancel',
        text: 'Cancel'
      },
      {
        onPress: async () => {
          setCount(prev => ({ ...prev, value: 0 }));
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        text: 'OK'
      }
    ],
    { cancelable: true }
  );
};
