import * as Haptics from 'expo-haptics';
import { countVar } from '../reactiveVars';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useReactiveVar } from '@apollo/client';
import { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export const CountingButtons = () => {
  const [buttonHeight, setButtonHeight] = useState(0);
  const count = useReactiveVar(countVar);

  const onPressDecrementButton = () => {
    if (count.value === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    countVar({ ...count, value: count.value - 1 });
  };

  const onPressIncrementButton = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    countVar({ ...count, value: count.value + 1 });
  };

  return (
    <View
      style={styles.countButtonsWrapper}
      onLayout={e => setButtonHeight(e.nativeEvent.layout.height)}
    >
      <TouchableOpacity onPress={onPressDecrementButton} style={styles.countButton}>
        <Ionicons
          color={'#fff'}
          name='remove-outline'
          size={Math.min(buttonHeight ? buttonHeight * 0.4 : 72, 72)}
        />
      </TouchableOpacity>
      <TouchableOpacity onPress={onPressIncrementButton} style={styles.countButton}>
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
