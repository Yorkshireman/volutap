import * as Haptics from 'expo-haptics';
import { countsVar } from '../reactiveVars';
import Ionicons from '@expo/vector-icons/Ionicons';
import { SavedAlert } from './savedAlert';
import Snackbar from 'react-native-snackbar';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
import uuid from 'react-native-uuid';
import { AlertType, type Count, Screens, TrackingEventNames } from '../types';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { track, updateCountInDb } from '../utils';
import { useEffect, useState } from 'react';

export const AlertSettings = () => {
  const [alertAtValue, setAlertAtValue] = useState<number | null>(null);
  const counts = useReactiveVar(countsVar);
  const db = useSQLiteContext();
  const [validationErrorMessage, setValidationErrorMessage] = useState('');

  const count = counts.find(c => c.currentlyCounting);

  useEffect(() => {
    if (!alertAtValue) setValidationErrorMessage('');
  }, [alertAtValue]);

  const onSubmitCount = async () => {
    if (!alertAtValue) return;
    if (!count) throw new Error('AlertSettings, onSubmitCount(): count is falsey.');

    if (count.alerts.find(({ at }) => at === alertAtValue)) {
      setValidationErrorMessage(
        `Alert already exists for ${alertAtValue} - do you need to turn it on?`
      );

      return;
    }

    const alertToSave = {
      at: alertAtValue,
      id: uuid.v4(),
      on: true,
      repeat: true,
      type: AlertType.SOUND_AND_VIBRATE
    };

    const updatedAlerts: Count['alerts'] = [
      ...count.alerts.filter(a => a.at !== alertAtValue),
      alertToSave
    ];

    const updatedCount: Count = { ...count, alerts: updatedAlerts };
    const updatedCounts = counts.map(c => (c.id === count.id ? updatedCount : c));

    const originalCounts = counts;
    countsVar(updatedCounts);

    const successCallback = () => {
      setAlertAtValue(null);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Snackbar.show({
        backgroundColor: '#0CCE6B',
        duration: Snackbar.LENGTH_LONG,
        text: 'Saved!',
        textColor: 'black'
      });

      track(
        TrackingEventNames.ALERT_SAVED,
        {
          alert: alertToSave,
          countId: updatedCount.id,
          screen: Screens.SETTINGS,
          source: 'alert_settings_input_field'
        },
        'alertSettings.tsx'
      );
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
      <Text style={styles.heading}>Alerts</Text>
      <View style={styles.alertForm}>
        <View style={styles.alertFormFirstRow}>
          <View style={styles.alertFormFirstRowFirstColumn}>
            <TextInput
              keyboardType='numeric'
              maxLength={7}
              onChangeText={v => setAlertAtValue(!v ? null : parseInt(v, 10))}
              onSubmitEditing={onSubmitCount}
              placeholder={'Number to alert at'}
              placeholderTextColor='#888'
              returnKeyType='done'
              style={styles.alertAtInput}
              value={alertAtValue?.toString() || undefined}
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={onSubmitCount}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        {!validationErrorMessage && !count?.alerts.length && (
          <View style={styles.alertAtInputInfoWrapper}>
            <Ionicons
              color='#444'
              name='information-circle-outline'
              size={24}
              style={styles.alertAtInputInfoIcon}
            />
            <Text style={styles.alertAtInputInfoText}>
              You can set one or more alerts to be notified by sound or vibration when the count
              reaches a specific number.
            </Text>
          </View>
        )}
        {validationErrorMessage && (
          <Text style={{ color: 'red', fontSize: 16 }}>{validationErrorMessage}</Text>
        )}
      </View>
      <View style={styles.savedAlerts}>
        {count?.alerts
          .slice()
          .sort((a, b) => a.at - b.at)
          .map(alert => (
            <SavedAlert alert={alert} count={count} key={alert.id} />
          ))}
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
    paddingHorizontal: 15,
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
    borderWidth: 2,
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
