import * as Haptics from 'expo-haptics';
import Ionicons from '@expo/vector-icons/Ionicons';
import { updateCountInDb } from '../utils';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { countChangeViaUserInteractionHasHappenedVar, countsVar } from '../reactiveVars';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

export const CountingButtons = () => {
  const [buttonHeight, setButtonHeight] = useState(0);
  const counts = useReactiveVar(countsVar);
  const db = useSQLiteContext();

  const count = counts.find(c => c.currentlyCounting);

  if (!count) return null;

  const incrementCount = async (newValue: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    const updatedCount = { ...count, lastModified: new Date().toISOString(), value: newValue };
    const updatedCounts = counts
      .map(c => (c.id === count.id ? updatedCount : c))
      .sort((a, b) => (a.lastModified > b.lastModified ? -1 : 1));

    const originalCounts = counts;
    countsVar(updatedCounts);
    updatedCount.saved &&
      (await updateCountInDb({
        db,
        errorCallback: () => countsVar(originalCounts),
        successCallback: () => countChangeViaUserInteractionHasHappenedVar(true),
        updatedCount
      }));
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
      <TouchableOpacity onPress={() => incrementCount(count.value + 1)} style={styles.countButton}>
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
