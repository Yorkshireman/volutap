import type { Alert } from '../types';
import { CountingModeContext } from '../contexts';
import { disableVolumeButtonCountingVar } from '../reactiveVars';
import { track } from '@amplitude/analytics-react-native';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useContext, useEffect, useRef } from 'react';
import { usePlaySound, useSetCountOnVolumeChange, useVibrate } from '../hooks';

export const Alarm = ({
  triggeredAlert,
  setTriggeredAlert
}: {
  triggeredAlert: Alert;
  setTriggeredAlert: React.Dispatch<React.SetStateAction<Alert | null>>;
}) => {
  const { countingWithVolumeButtons } = useContext(CountingModeContext);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const { setVolumeToMid } = useSetCountOnVolumeChange(countingWithVolumeButtons);
  usePlaySound(triggeredAlert);
  useVibrate(triggeredAlert);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          duration: 500,
          toValue: 1,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          duration: 500,
          toValue: 0,
          useNativeDriver: true
        })
      ])
    );

    if (!triggeredAlert) {
      pulseAnim.setValue(0);
      return;
    }

    loop.start();
    disableVolumeButtonCountingVar(true);

    return () => {
      loop.stop();
      disableVolumeButtonCountingVar(false);
      setVolumeToMid();
    };
  }, [pulseAnim, setVolumeToMid, triggeredAlert]);

  const backgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['black', '#444']
  });

  const onDismiss = () => {
    setTriggeredAlert(null);
    track('alert_dismissed', { alert: triggeredAlert });
  };

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <Text ellipsizeMode='tail' numberOfLines={1} style={styles.countText}>
        {triggeredAlert?.at}
      </Text>
      <Text ellipsizeMode='tail' numberOfLines={1} style={styles.subText}>
        Reached!
      </Text>
      <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
        <Text style={styles.dismissButtonText}>Dismiss</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 50,
    left: '3%',
    padding: 25,
    position: 'absolute',
    right: 0,
    top: 60,
    width: '94%',
    zIndex: 1000
  },
  countText: {
    color: 'white',
    flexShrink: 1,
    fontSize: 64,
    fontWeight: 'bold'
  },
  dismissButton: {
    alignItems: 'center',
    backgroundColor: '#FF8600',
    borderRadius: 30,
    padding: 18,
    width: '100%'
  },
  dismissButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold'
  },
  subText: {
    color: 'white',
    flexShrink: 1,
    fontSize: 48,
    marginBottom: 12
  }
});
