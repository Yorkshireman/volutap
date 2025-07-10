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
      <View style={styles.alertForm}>
        <View style={styles.alertFormFirstRow}>
          <View style={styles.alertFormFirstRowFirstColumn}>
            <TextInput
              maxLength={7}
              onChangeText={v => setNewCountValue(!v ? null : parseInt(v, 10))}
              onSubmitEditing={onSubmitCount}
              placeholder={`Count is currently at ${count.value}`}
              placeholderTextColor='#888'
              returnKeyType='done'
              keyboardType='numeric'
              style={styles.alertAtInput}
              value={newCountValue?.toString() || undefined}
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={onSubmitCount}>
            <Text style={styles.addButtonText}>Set</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  addButton: {
    alignItems: 'center',
    backgroundColor: '#27187E',
    borderRadius: 10,
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 6
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
  alertAtInput: {
    borderColor: '#FF8600',
    borderRadius: 8,
    borderWidth: 3,
    color: '#222',
    flex: 1,
    fontSize: 18,
    paddingHorizontal: 5,
    paddingVertical: 4
  },
  alertAtInputInfoIcon: {
    fontSize: 18,
    paddingTop: 1
  },
  alertAtInputInfoText: {
    color: '#444',
    flexShrink: 1,
    fontSize: 16
  },
  alertAtInputInfoWrapper: {
    flexDirection: 'row',
    gap: 3,
    paddingLeft: 5
  },
  alertAtText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  alertForm: {
    gap: 5
  },
  alertFormFirstRow: {
    flexDirection: 'row',
    gap: 5,
    justifyContent: 'space-between'
  },
  alertFormFirstRowFirstColumn: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    gap: 5
  },
  container: {
    alignSelf: 'stretch',
    backgroundColor: '#fff',
    borderRadius: 15,
    gap: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 8
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  savedAlert: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  savedAlertFirstColumn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5
  },
  savedAlerts: {
    gap: 10
  }
});
