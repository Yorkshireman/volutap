import { countVar } from '../reactiveVars';
import { AlertType, Count } from '../types';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useEffect, useState } from 'react';

export const SavedAlert = ({ alert, count }: { alert: Count['alerts'][number]; count: Count }) => {
  const [alertAtValue, setAlertAtValue] = useState<number | null>(null);
  const [alertOnValue, setAlertOnValue] = useState<boolean>(alert.on);

  useEffect(() => {
    setAlertAtValue(alert.at);
    setAlertOnValue(alert.on);
  }, [alert.at, alert.on]);

  const onToggleAlert = () => {
    const newAlertOnValue = !alertOnValue;
    setAlertOnValue(newAlertOnValue);
    const updatedAlerts = count.alerts.map(a =>
      a.id === alert.id ? { ...a, on: newAlertOnValue } : a
    );

    countVar({ ...count, alerts: updatedAlerts });
  };

  return (
    <View style={styles.container}>
      <View style={styles.firstRow}>
        <View style={styles.firstColumn}>
          <Text style={styles.alertAtText}>Alert at:</Text>
          <TextInput
            keyboardType='numeric'
            maxLength={6}
            onChangeText={v => setAlertAtValue(!v ? null : parseInt(v, 10))}
            onSubmitEditing={() => {
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

              countVar({ ...count, alerts: updatedAlerts });
            }}
            placeholder={'Number'}
            returnKeyType='done'
            style={styles.alertAtInput}
            value={alertAtValue?.toString() || undefined}
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            const updatedAlerts = count.alerts.filter(a => a.id !== alert.id);
            countVar({ ...count, alerts: updatedAlerts });
            console.log(`Deleted alert with ID: ${alert.id}`);
          }}
        >
          <Text>trash</Text>
        </TouchableOpacity>
        <Switch
          onValueChange={onToggleAlert}
          trackColor={{ false: 'red', true: '#0CCE6B' }}
          value={alertOnValue}
        />
      </View>
      <View style={styles.secondRow}>
        <Text style={styles.alertAtText}>Sound on alert</Text>
        <Switch
          disabled={!alert.on}
          onValueChange={soundOn => {
            const newType = soundOn ? AlertType.SOUND_AND_VIBRATE : AlertType.VIBRATE;
            const updatedAlerts = count.alerts.map(a =>
              a.id === alert.id ? { ...a, type: newType } : a
            );

            countVar({ ...count, alerts: updatedAlerts });
          }}
          trackColor={{ false: '#222', true: '#0CCE6B' }}
          value={
            !alert.on
              ? false
              : alert.type === AlertType.SOUND || alert.type === AlertType.SOUND_AND_VIBRATE
          }
        />
      </View>
      <View style={styles.thirdRow}>
        <Text style={styles.alertAtText}>Vibrate on alert</Text>
        <Switch
          disabled={!alert.on}
          onValueChange={vibrateOn => {
            const newType = vibrateOn ? AlertType.SOUND_AND_VIBRATE : AlertType.SOUND;
            const updatedAlerts = count.alerts.map(a =>
              a.id === alert.id ? { ...a, type: newType } : a
            );

            countVar({ ...count, alerts: updatedAlerts });
          }}
          trackColor={{ false: '#222', true: '#0CCE6B' }}
          value={
            !alert.on
              ? false
              : alert.type === AlertType.VIBRATE || alert.type === AlertType.SOUND_AND_VIBRATE
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  alertAtInput: {
    borderRadius: 8,
    borderWidth: 1,
    color: '#222',
    fontSize: 18,
    paddingHorizontal: 15,
    paddingVertical: 2
  },
  alertAtText: {
    color: '#222',
    fontSize: 18
  },
  container: {
    gap: 10
  },
  firstColumn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5
  },
  firstRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  secondRow: {
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
