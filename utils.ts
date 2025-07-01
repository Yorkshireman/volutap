import * as Haptics from 'expo-haptics';
import { Alert } from 'react-native';

export const onPressReset = (
  count: number,
  setCount: React.Dispatch<React.SetStateAction<number>>
) => {
  if (count === 0) return;
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
          setCount(0);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        },
        text: 'OK'
      }
    ],
    { cancelable: true }
  );
};
