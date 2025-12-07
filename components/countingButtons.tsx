import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useReactiveVar } from '@apollo/client';
import { useSetSavedCountValue } from '../hooks';
import { useState } from 'react';
import { countChangeViaUserInteractionHasHappenedVar, countVar } from '../reactiveVars';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export const CountingButtons = () => {
  const [buttonHeight, setButtonHeight] = useState(0);
  const count = useReactiveVar(countVar);
  const setSavedCountValue = useSetSavedCountValue();

  const incrementCount = (newValue: number) => {
    if (!count.id) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      countVar({ ...count, value: newValue });
      countChangeViaUserInteractionHasHappenedVar(true);
    } else {
      setSavedCountValue(newValue, count.id);
    }
  };

  return (
    <View
      style={styles.countButtonsWrapper}
      onLayout={e => setButtonHeight(e.nativeEvent.layout.height)}
    >
      <TouchableOpacity
        onPress={() => {
          if (count.value === 0) return;
          incrementCount(count.value - 1);
        }}
        style={styles.countButton}
      >
        <Ionicons
          color={'#fff'}
          name='remove-outline'
          size={Math.min(buttonHeight ? buttonHeight * 0.4 : 72, 72)}
        />
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          incrementCount(count.value + 1);
        }}
        style={styles.countButton}
      >
        <Ionicons
          color={'#fff'}
          name='add-outline'
          size={Math.min(buttonHeight ? buttonHeight * 0.4 : 72, 72)}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  countButton: {
    alignItems: 'center',
    borderColor: '#fff',
    borderRadius: 50,
    borderWidth: 3,
    flex: 1,
    justifyContent: 'center',
    padding: 20
  },
  countButtonsWrapper: {
    flex: 2,
    flexDirection: 'row',
    gap: 30
  }
});
