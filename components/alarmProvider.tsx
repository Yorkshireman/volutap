import { countVar } from '../reactiveVars';
import { useAudioPlayer } from 'expo-audio';
import { useReactiveVar } from '@apollo/client';
import { useUpdateSavedCountOnCountChange } from '../hooks';
import { Alert, AlertType, Count } from '../types';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useEffect, useRef, useState } from 'react';

const audioSource = require('../assets/beep-alarm-366507.mp3');

const usePlaySound = (triggeredAlert: Alert | null) => {
  const player = useAudioPlayer(audioSource);

  useEffect(() => {
    if (
      triggeredAlert &&
      (triggeredAlert.type === AlertType.SOUND ||
        triggeredAlert.type === AlertType.SOUND_AND_VIBRATE)
    ) {
      player.seekTo(0);
      player.play();
      return;
    }
  }, [triggeredAlert, player]);
};

const Alarm = ({
  triggeredAlert,
  setTriggeredAlert
}: {
  triggeredAlert: Alert;
  setTriggeredAlert: React.Dispatch<React.SetStateAction<Alert | null>>;
}) => {
  const pulseAnim = useRef(new Animated.Value(0)).current;
  usePlaySound(triggeredAlert);

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

    return () => {
      loop.stop();
    };
  }, [pulseAnim, triggeredAlert]);

  const backgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['black', '#444']
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <Text ellipsizeMode='tail' numberOfLines={1} style={styles.countText}>
        {triggeredAlert?.at}
      </Text>
      <Text ellipsizeMode='tail' numberOfLines={1} style={styles.subText}>
        Reached!
      </Text>
      <TouchableOpacity onPress={() => setTriggeredAlert(null)} style={styles.dismissButton}>
        <Text style={styles.dismissButtonText}>Dismiss</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const AlarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const count = useReactiveVar(countVar);
  useUpdateSavedCountOnCountChange();
  const [triggeredAlert, setTriggeredAlert] = useState<Alert | null>(null);
  const triggerCountValues: Count['value'][] = count.alerts
    .filter(alert => alert.on)
    .map(alert => alert.at);

  const countTriggerReached = triggerCountValues.includes(count.value);

  useEffect(() => {
    if (countTriggerReached) {
      const triggeredAlert = count.alerts.find(alert => alert.at === count.value);
      setTriggeredAlert(triggeredAlert || null);
      if (triggeredAlert && !triggeredAlert.repeat) {
        const updatedAlert = { ...triggeredAlert, on: false };
        countVar({
          ...count,
          alerts: count.alerts.map(alert => (alert.id === updatedAlert.id ? updatedAlert : alert))
        });
      }
    }
  }, [count, countTriggerReached]);

  return (
    <>
      {triggeredAlert && (
        <Alarm triggeredAlert={triggeredAlert} setTriggeredAlert={setTriggeredAlert} />
      )}
      {children}
    </>
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
