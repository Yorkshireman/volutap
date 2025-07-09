import { countVar } from '../reactiveVars';
import { useReactiveVar } from '@apollo/client';
import { Animated, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useEffect, useRef } from 'react';

export const Alert = () => {
  const { alerts, value } = useReactiveVar(countVar);
  const triggers = alerts.map(alert => alert.at);

  // if (!triggers.includes(value)) {
  //   return null; // No alert to show
  // }

  // Pulse animation setup
  const pulseAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          duration: 800,
          toValue: 1,
          useNativeDriver: false
        }),
        Animated.timing(pulseAnim, {
          duration: 800,
          toValue: 0,
          useNativeDriver: false
        })
      ])
    ).start();
  }, [pulseAnim]);

  const backgroundColor = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['black', '#444']
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <Text style={{ color: 'white', fontSize: 24 }}>ALERT!</Text>
      <TouchableOpacity
        onPress={() => {
          console.log('Alert dismissed or action taken');
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
