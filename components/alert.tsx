import { countVar } from '../reactiveVars';
import { useReactiveVar } from '@apollo/client';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useEffect, useRef, useState } from 'react';

export const Alert = () => {
  const { alerts, value } = useReactiveVar(countVar);
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const [shouldShow, setShouldShow] = useState(false);
  const triggers = alerts.filter(alert => alert.on).map(alert => alert.at);

  const countTriggerReached = triggers.includes(value);

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

    if (!shouldShow) {
      pulseAnim.setValue(0);
      return;
    }

    loop.start();

    return () => {
      loop.stop();
    };
  }, [pulseAnim, shouldShow]);

  useEffect(() => {
    if (countTriggerReached) {
      setShouldShow(true);
    }
  }, [countTriggerReached]);

  const backgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['black', '#444']
  });

  if (!shouldShow) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <Text style={{ color: 'white', fontSize: 24 }}>ALERT!</Text>
      <TouchableOpacity
        onPress={() => {
          setShouldShow(false);
        }}
      >
        <Text style={styles.dismissButton}>Dismiss</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    borderRadius: 50,
    flexDirection: 'row',
    height: 150,
    justifyContent: 'space-between',
    left: '3%',
    paddingHorizontal: 40,
    paddingVertical: 30,
    position: 'absolute',
    right: 0,
    top: 60,
    width: '94%',
    zIndex: 1000
  },
  dismissButton: {
    backgroundColor: '#FF8600',
    borderRadius: 30,
    color: 'white',
    fontSize: 18,
    padding: 20
  }
});
