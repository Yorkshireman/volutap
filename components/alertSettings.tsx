import { countVar } from '../reactiveVars';
import { useReactiveVar } from '@apollo/client';
import uuid from 'react-native-uuid';
import { AlertType, type Count } from '../types';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';

const SavedAlert = ({ alert, count }: { alert: Count['alerts'][number]; count: Count }) => {
  const [alertAtValue, setAlertAtValue] = useState<number | null>(null);
  useEffect(() => setAlertAtValue(alert.at), [alert.at]);

  return (
    <View style={styles.savedAlert}>
      <View style={styles.savedAlertFirstColumn}>
        {/* change to dropdown select */}
        <Text style={styles.alertAtText}>Alert at:</Text>
        <TextInput
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
          keyboardType='numeric'
          style={styles.alertAtInput}
          value={alertAtValue?.toString() || undefined}
        />
      </View>
      <Switch onValueChange={v => console.log(v)} value={!!alertAtValue} />
    </View>
  );
};

export const AlertSettings = () => {
  const [alertAtValue, setAlertAtValue] = useState<number | null>(null);
  const count = useReactiveVar(countVar);
  console.log('========== count ==========');
  console.log(JSON.stringify(count, null, 2));
  console.log('========== end ===========');

  return (
    <View style={styles.container}>
      <View style={styles.alertForm}>
        <View style={styles.alertFormFirstColumn}>
          <Text style={styles.alertAtText}>Alert at:</Text>
          <TextInput
            maxLength={6}
            onChangeText={v => setAlertAtValue(!v ? null : parseInt(v, 10))}
            onSubmitEditing={() => {
              if (!alertAtValue) return;
              if (count.alerts.find(a => a.at === alertAtValue)) {
                console.warn(`Alert already set for ${alertAtValue}`);
                return;
              }

              const id = uuid.v4();
              const updatedAlerts: Count['alerts'] = [
                ...count.alerts.filter(a => a.at !== alertAtValue),
                {
                  at: alertAtValue,
                  id: id,
                  on: true,
                  repeat: false,
                  type: AlertType.SOUND
                }
              ];

              countVar({ ...count, alerts: updatedAlerts });
              setAlertAtValue(null);
            }}
            placeholder={'Number'}
            returnKeyType='done'
            keyboardType='numeric'
            style={styles.alertAtInput}
            value={alertAtValue?.toString() || undefined}
          />
        </View>
        <Switch onValueChange={v => console.log(v)} value={!!alertAtValue} />
      </View>
      <View style={styles.savedAlerts}>
        {count.alerts
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
  alertAtInput: {
    borderRadius: 8,
    borderWidth: 1,
    color: '#222',
    fontSize: 18,
    paddingHorizontal: 10,
    paddingVertical: 2
  },
  alertAtText: {
    color: '#222',
    fontSize: 18
  },
  alertForm: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  alertFormFirstColumn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5
  },
  container: {
    gap: 10
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
