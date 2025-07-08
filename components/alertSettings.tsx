import * as Haptics from 'expo-haptics';
import { countVar } from '../reactiveVars';
import { SavedAlert } from './savedAlert';
import Snackbar from 'react-native-snackbar';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
import uuid from 'react-native-uuid';
import { AlertType, type Count } from '../types';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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
  const [showValidationErrorMessage, setShowValidationErrorMessage] = useState(false);

  useEffect(() => {
    if (!alertAtValue) setShowValidationErrorMessage(false);
  }, [alertAtValue]);

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

  const onSubmitCount = () => {
    if (!alertAtValue) return;
    if (count.alerts.find(({ at }) => at === alertAtValue)) {
      setShowValidationErrorMessage(true);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Snackbar.show({
      backgroundColor: '#0CCE6B',
      duration: Snackbar.LENGTH_LONG,
      text: 'Saved!',
      textColor: 'black'
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.alertForm}>
        <View style={styles.alertFormFirstRow}>
          <View style={styles.alertFormFirstRowFirstColumn}>
            <Text style={styles.alertAtText}>Alert at:</Text>
            <TextInput
              maxLength={6}
              onChangeText={v => setAlertAtValue(!v ? null : parseInt(v, 10))}
              onSubmitEditing={onSubmitCount}
              placeholder={'Number'}
              returnKeyType='done'
              keyboardType='numeric'
              style={styles.alertAtInput}
              value={alertAtValue?.toString() || undefined}
            />
          </View>
          <TouchableOpacity style={styles.addButton} onPress={onSubmitCount}>
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>
        {showValidationErrorMessage && (
          <Text style={{ color: 'red', fontSize: 16 }}>
            Alert already exists for {alertAtValue} - do you need to turn it on?
          </Text>
        )}
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
  addButton: {
    alignItems: 'center',
    backgroundColor: '#27187E',
    borderColor: '#27187E',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 15,
    paddingVertical: 3
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18
  },
  alertAtInput: {
    borderRadius: 8,
    borderWidth: 1,
    color: '#222',
    fontSize: 18,
    paddingHorizontal: 15,
    paddingVertical: 2,
    width: 100
  },
  alertAtText: {
    color: '#222',
    fontSize: 18
  },
  alertForm: {
    gap: 2
  },
  alertFormFirstRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%'
  },
  alertFormFirstRowFirstColumn: {
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
