import * as Haptics from 'expo-haptics';
import Snackbar from 'react-native-snackbar';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Count, CountValueChangeSource, Screens } from '../types';
import { countChangeViaUserInteractionHasHappenedVar, countsVar } from '../reactiveVars';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { trackIncrementCount, updateCountInDb } from '../utils';

export const SetCount = () => {
  const [newCountValue, setNewCountValue] = useState<Count['value'] | null>(null);
  const counts = useReactiveVar(countsVar);
  const db = useSQLiteContext();

  const count = counts.find(c => c.currentlyCounting);

  const onSubmitCount = async () => {
    if (!count) throw new Error('SetCount onSubmitCount(): count is falsey.');
    if (!newCountValue) return;

    const updatedCount: Count = {
      ...count,
      lastModified: new Date().toISOString(),
      value: newCountValue
    };

    const updatedCounts = counts
      .map(c => (c.id === count.id ? updatedCount : c))
      .sort((a, b) => (a.lastModified > b.lastModified ? -1 : 1));

    const originalCounts = counts;
    countChangeViaUserInteractionHasHappenedVar(false);
    countsVar(updatedCounts);

    const successCallback = () => {
      setNewCountValue(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      Snackbar.show({
        backgroundColor: '#0CCE6B',
        duration: Snackbar.LENGTH_LONG,
        text: `Count set to ${newCountValue}`,
        textColor: 'black'
      });

      trackIncrementCount(count, updatedCount, Screens.SETTINGS, CountValueChangeSource.SET_COUNT);
    };

    if (updatedCount.saved) {
      await updateCountInDb({
        db,
        errorCallback: () => countsVar(originalCounts),
        successCallback,
        updatedCount
      });
    } else {
      successCallback();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Change Count</Text>
      <View style={styles.form}>
        <TextInput
          maxLength={7}
          onChangeText={v => setNewCountValue(!v ? null : parseInt(v, 10))}
          onSubmitEditing={onSubmitCount}
          placeholder={`Count is currently at ${count?.value}`}
          placeholderTextColor='#888'
          returnKeyType='done'
          keyboardType='numeric'
          style={styles.input}
          value={newCountValue?.toString() || undefined}
        />
        <TouchableOpacity style={styles.setButton} onPress={onSubmitCount}>
          <Text style={styles.setButtonText}>Set</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 15,
    gap: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 8
  },
  form: {
    flexDirection: 'row',
    gap: 5
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  input: {
    borderColor: '#FF8600',
    borderRadius: 8,
    borderWidth: 2,
    color: '#222',
    flex: 1,
    fontSize: 18,
    paddingHorizontal: 5,
    paddingVertical: 4
  },
  setButton: {
    backgroundColor: '#27187E',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 6
  },
  setButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  }
});
