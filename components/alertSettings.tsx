import { countVar } from '../reactiveVars';
import { SavedAlert } from './savedAlert';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
import uuid from 'react-native-uuid';
import { AlertType, type Count } from '../types';
import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useEffect, useRef, useState } from 'react';

const countIsMissingRequiredFields = (count: Count): boolean => {
  return (
    !count.alerts ||
    !count.createdAt ||
    count.currentlyCounting === undefined ||
    !count.id ||
    !count.lastModified ||
    !count.title ||
    count.value === undefined
  );
};

export const AlertSettings = () => {
  const [alertAtValue, setAlertAtValue] = useState<number | null>(null);
  const count = useReactiveVar(countVar);
  const db = useSQLiteContext();
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    if (!count.id) return;

    async function updateCountInDB() {
      try {
        if (countIsMissingRequiredFields(count)) {
          console.warn('Count in state is missing required fields, not updating DB:', count);
          return;
        }

        await db.runAsync(
          `UPDATE savedCounts SET
            alerts = ?,
            createdAt = ?,
            currentlyCounting = ?,
            lastModified = ?,
            title = ?,
            value = ?
            WHERE id = ?`,
          [
            JSON.stringify(count.alerts),
            count.createdAt!,
            count.currentlyCounting!,
            count.lastModified!,
            count.title!,
            count.value,
            count.id!
          ]
        );

        console.log('Count updated in DB:', count);
      } catch (error) {
        console.error('Error updating count in DB:', error);
      }
    }

    updateCountInDB();
  }, [count, db]);

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
