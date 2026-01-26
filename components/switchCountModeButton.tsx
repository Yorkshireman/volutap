import * as Haptics from 'expo-haptics';
import { CountingModeContext } from '../contexts';
import { track } from '@amplitude/analytics-react-native';
import { TrackingEventNames } from '../types';
import { useContext } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const SwitchCountModeButton = () => {
  const { countingWithVolumeButtons, setCountingWithVolumeButtons } =
    useContext(CountingModeContext);

  const onPressSwitchCountModeButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const selectedMode = countingWithVolumeButtons ? 'screen_buttons' : 'volume_buttons';
    track(TrackingEventNames.COUNTING_MODE_CHANGED, { selectedMode, source: 'button' });
    setCountingWithVolumeButtons(!countingWithVolumeButtons);
  };

  return (
    <View style={styles.switchCountModeButtonWrapper}>
      <TouchableOpacity onPress={onPressSwitchCountModeButton} style={styles.switchCountModeButton}>
        <Text style={styles.switchCountModeButtonText}>
          {countingWithVolumeButtons
            ? 'Switch to using screen buttons'
            : 'Switch to using volume buttons'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  switchCountModeButton: {
    borderColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    padding: 18
  },
  switchCountModeButtonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center'
  },
  switchCountModeButtonWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%'
  }
});
