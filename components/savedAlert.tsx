import * as Haptics from 'expo-haptics';
import { countsVar } from '../reactiveVars';
import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import Snackbar from 'react-native-snackbar';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { AlertType, Count, Screens, TrackingEventNames } from '../types';
import { track, updateCountInDb } from '../utils';
import { useEffect, useState } from 'react';

const {
  ALERT_AT_VALUE_EDITED,
  ALERT_DELETED,
  ALERT_PLAY_SOUND_TOGGLED_OFF,
  ALERT_PLAY_SOUND_TOGGLED_ON,
  ALERT_REPEATING_TOGGLED_OFF,
  ALERT_REPEATING_TOGGLED_ON,
  ALERT_VIBRATE_TOGGLED_OFF,
  ALERT_VIBRATE_TOGGLED_ON,
  ALERT_TOGGLED_OFF,
  ALERT_TOGGLED_ON
} = TrackingEventNames;

const screen = Screens.SETTINGS;

export const SavedAlert = ({ alert, count }: { alert: Count['alerts'][number]; count: Count }) => {
  const [alertAtValue, setAlertAtValue] = useState<number | null>(null);
  const [alertOnValue, setAlertOnValue] = useState<boolean>(alert.on);
  const countId = count.id;
  const counts = useReactiveVar(countsVar);
  const db = useSQLiteContext();

  useEffect(() => {
    setAlertAtValue(alert.at);
    setAlertOnValue(alert.on);
  }, [alert.at, alert.on]);

  const updateCounts = async (updatedCount: Count, onSuccess?: () => void) => {
    const updatedCounts = counts.map(c => (c.id === count.id ? updatedCount : c));
    const originalCounts = counts;
    countsVar(updatedCounts);
    updatedCount.saved &&
      (await updateCountInDb({
        db,
        errorCallback: () => countsVar(originalCounts),
        successCallback: onSuccess,
        updatedCount
      }));
  };

  const onConfirmDeleteAlert = async () => {
    const updatedAlerts = count.alerts.filter(a => a.id !== alert.id);
    await updateCounts({ ...count, alerts: updatedAlerts }, () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Snackbar.show({
        backgroundColor: '#0CCE6B',
        duration: Snackbar.LENGTH_LONG,
        text: 'Alert Deleted',
        textColor: 'black'
      });

      track(
        ALERT_DELETED,
        {
          alert,
          countId,
          screen,
          source: 'alert_settings_delete_icon'
        },
        'savedAlert.tsx onConfirmDeleteAlert()'
      );
    });
  };

  const onSubmitEditingAlertAtValue = async () => {
    if (!alertAtValue) return;
    if (count.alerts.find(a => a.at === alertAtValue)) {
      console.warn(`Alert already set for ${alertAtValue}`);
      return;
    }

    const updatedAlerts: Count['alerts'] = [
      ...count.alerts.filter(a => a.id !== alert.id),
      {
        ...alert,
        at: alertAtValue
      }
    ];

    await updateCounts({ ...count, alerts: updatedAlerts }, () => {
      track(
        ALERT_AT_VALUE_EDITED,
        {
          alert: updatedAlerts.find(a => a.id === alert.id),
          countId,
          newValue: alertAtValue,
          oldValue: alert.at,
          screen,
          source: 'alert_settings_alert_at_input_field'
        },
        'savedAlert.tsx onSubmitEditingAlertAtValue()'
      );
    });
  };

  const onToggleAlert = async () => {
    const newAlertOnValue = !alertOnValue;
    setAlertOnValue(newAlertOnValue);
    const updatedAlerts = count.alerts.map(a =>
      a.id === alert.id ? { ...a, on: newAlertOnValue } : a
    );

    await updateCounts({ ...count, alerts: updatedAlerts }, () => {
      const eventName = newAlertOnValue ? ALERT_TOGGLED_ON : ALERT_TOGGLED_OFF;
      track(
        eventName,
        {
          alert: updatedAlerts.find(a => a.id === alert.id),
          countId,
          screen,
          source: 'alert_settings_alert_at_toggle'
        },
        'savedAlert.tsx onToggleAlert()'
      );
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.firstRow}>
        <View style={styles.firstRowFirstColumn}>
          <Text style={styles.alertAtText}>Alert at:</Text>
          <TextInput
            keyboardType='numeric'
            maxLength={6}
            onChangeText={v => setAlertAtValue(!v ? null : parseInt(v, 10))}
            onSubmitEditing={onSubmitEditingAlertAtValue}
            placeholder={'Number'}
            returnKeyType='done'
            style={styles.alertAtInput}
            value={alertAtValue?.toString() || undefined}
          />
        </View>
        <View style={styles.firstRowSecondColumn}>
          <TouchableOpacity
            onPress={() => {
              Alert.alert('Delete Alert', `Are you sure?`, [
                {
                  style: 'cancel',
                  text: 'Cancel'
                },
                {
                  onPress: onConfirmDeleteAlert,
                  style: 'destructive',
                  text: 'Delete'
                }
              ]);
            }}
          >
            <Ionicons
              name='trash-outline'
              size={24}
              color='#D44D5C'
              style={{ paddingHorizontal: 10, paddingVertical: 5 }}
            />
          </TouchableOpacity>
          <Switch
            onValueChange={onToggleAlert}
            trackColor={{ false: 'red', true: '#758BFD' }}
            value={alertOnValue}
          />
        </View>
      </View>
      <View style={styles.secondRow}>
        <View style={styles.secondRowFirstRow}>
          <Text style={styles.alertAtText}>Repeating</Text>
          <Switch
            disabled={!alert.on}
            onValueChange={async repeat => {
              const updatedAlerts = count.alerts.map(a =>
                a.id === alert.id ? { ...a, repeat } : a
              );

              await updateCounts({ ...count, alerts: updatedAlerts }, () => {
                const eventName = repeat ? ALERT_REPEATING_TOGGLED_ON : ALERT_REPEATING_TOGGLED_OFF;
                track(
                  eventName,
                  {
                    alert: updatedAlerts.find(a => a.id === alert.id),
                    countId,
                    screen,
                    source: 'alert_settings_repeating_toggle'
                  },
                  'savedAlert.tsx Repeating Switch'
                );
              });
            }}
            trackColor={{ false: '#222', true: '#758BFD' }}
            value={alert.on ? alert.repeat : false}
          />
        </View>
        <View style={styles.infoWrapper}>
          <Ionicons
            name='information-circle-outline'
            size={20}
            color='#444'
            style={styles.infoWrapperIcon}
          />
          <Text style={styles.infoWrapperText}>
            If enabled, the alert will trigger every time the count reaches {alert.at}
          </Text>
        </View>
      </View>
      <View style={styles.thirdRow}>
        <Text style={styles.alertAtText}>Vibrate</Text>
        <Switch
          disabled={!alert.on}
          onValueChange={async vibrateOn => {
            const newType = vibrateOn ? AlertType.SOUND_AND_VIBRATE : AlertType.SOUND;
            const updatedAlerts = count.alerts.map(a =>
              a.id === alert.id ? { ...a, type: newType } : a
            );

            await updateCounts({ ...count, alerts: updatedAlerts }, () => {
              const eventName = vibrateOn ? ALERT_VIBRATE_TOGGLED_ON : ALERT_VIBRATE_TOGGLED_OFF;
              track(
                eventName,
                {
                  alert: updatedAlerts.find(a => a.id === alert.id),
                  countId,
                  screen,
                  source: 'alert_settings_vibrate_toggle'
                },
                'savedAlert.tsx Vibrate Switch'
              );
            });
          }}
          trackColor={{ false: '#222', true: '#758BFD' }}
          value={
            !alert.on
              ? false
              : alert.type === AlertType.VIBRATE || alert.type === AlertType.SOUND_AND_VIBRATE
          }
        />
      </View>
      <View style={styles.fourthRow}>
        <Text style={styles.alertAtText}>Play Sound</Text>
        <Switch
          disabled={!alert.on}
          onValueChange={async soundOn => {
            const newType = soundOn ? AlertType.SOUND_AND_VIBRATE : AlertType.VIBRATE;
            const updatedAlerts = count.alerts.map(a =>
              a.id === alert.id ? { ...a, type: newType } : a
            );

            await updateCounts({ ...count, alerts: updatedAlerts }, () => {
              const eventName = soundOn
                ? ALERT_PLAY_SOUND_TOGGLED_ON
                : ALERT_PLAY_SOUND_TOGGLED_OFF;

              track(
                eventName,
                {
                  alert: updatedAlerts.find(a => a.id === alert.id),
                  countId,
                  screen,
                  source: 'alert_settings_play_sound_toggle'
                },
                'savedAlert.tsx Play Sound Switch'
              );
            });
          }}
          trackColor={{ false: '#222', true: '#758BFD' }}
          value={
            !alert.on
              ? false
              : alert.type === AlertType.SOUND || alert.type === AlertType.SOUND_AND_VIBRATE
          }
        />
      </View>
      <TouchableOpacity
        onPress={() => router.push('/settingsTroubleshooting')}
        style={styles.fifthRow}
      >
        <Text style={styles.fifthRowText}>Having trouble?</Text>
        <Ionicons name='chevron-forward' size={24} color='#758BFD' />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  alertAtInput: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingVertical: 2
  },
  alertAtText: {
    color: '#222',
    fontSize: 18,
    fontWeight: 'bold'
  },
  container: {
    backgroundColor: '#f2eeed',
    borderRadius: 15,
    gap: 10,
    padding: 10
  },
  fifthRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4
  },
  fifthRowText: {
    color: '#758BFD',
    fontSize: 16,
    fontWeight: 'bold'
  },
  firstRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  firstRowFirstColumn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5
  },
  firstRowSecondColumn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 20
  },
  fourthRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  infoWrapper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5
  },
  infoWrapperIcon: {
    alignSelf: 'flex-start'
  },
  infoWrapperText: {
    color: '#444',
    flexShrink: 1,
    fontSize: 14
  },
  secondRow: {
    gap: 1
  },
  secondRowFirstRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  thirdRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  }
});
