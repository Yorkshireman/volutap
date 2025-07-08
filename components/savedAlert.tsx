import type { Count } from '../types';
import { countVar } from '../reactiveVars';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useEffect, useState } from 'react';

export const SavedAlert = ({ alert, count }: { alert: Count['alerts'][number]; count: Count }) => {
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
  savedAlert: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  savedAlertFirstColumn: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5
  }
});
