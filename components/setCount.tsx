import * as Haptics from 'expo-haptics';
import type { Count } from '../types';
import { countVar } from '../reactiveVars';
import Snackbar from 'react-native-snackbar';
import { useReactiveVar } from '@apollo/client';
import { useState } from 'react';
import { useUpdateSavedCountOnCountChange } from '../hooks';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export const SetCount = () => {
  const [newCountValue, setNewCountValue] = useState<Count['value'] | null>(null);
  const count = useReactiveVar(countVar);
  useUpdateSavedCountOnCountChange();

  const onSubmitCount = () => {
    if (!newCountValue) return;
    countVar({ ...count, value: newCountValue });
    setNewCountValue(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    Snackbar.show({
      backgroundColor: '#0CCE6B',
      duration: Snackbar.LENGTH_LONG,
      text: `Count set to ${newCountValue}`,
      textColor: 'black'
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Change Count</Text>
      <View style={styles.form}>
        <TextInput
          maxLength={7}
          onChangeText={v => setNewCountValue(!v ? null : parseInt(v, 10))}
          onSubmitEditing={onSubmitCount}
          placeholder={`Count is currently at ${count.value}`}
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
    borderWidth: 3,
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
