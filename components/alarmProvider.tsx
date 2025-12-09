import { Alarm } from './alarm';
import { useReactiveVar } from '@apollo/client';
import { useUpdateSavedCountOnCountChange } from '../hooks';
import { Alert, Count, SavedCount } from '../types';
import {
  countChangeViaUserInteractionHasHappenedVar,
  countVar,
  savedCountsVar
} from '../reactiveVars';
import { useEffect, useRef, useState } from 'react';

const findValueChangedSavedCount = (
  prevSavedCounts: SavedCount[] | null,
  currentSavedCounts: SavedCount[]
) => {
  if (!prevSavedCounts) return undefined;

  for (let i = 0; i < currentSavedCounts.length; i++) {
    const prevSavedCount = prevSavedCounts.find(sc => sc.id === currentSavedCounts[i].id);
    if (prevSavedCount && prevSavedCount.value !== currentSavedCounts[i].value) {
      console.log('valueChangedSavedCount: ', currentSavedCounts[i]);
      return currentSavedCounts[i];
    }
  }

  return undefined;
};

export const AlarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const count = useReactiveVar(countVar);
  const savedCounts = useReactiveVar(savedCountsVar);

  const prevCountValueRef = useRef<number | undefined>(undefined);
  const prevSavedCountsRef = useRef<SavedCount[] | null>(null);
  useUpdateSavedCountOnCountChange(); // needed?
  const [triggeredAlert, setTriggeredAlert] = useState<Alert | null>(null);

  const triggerCountValues: Count['value'][] = count.alerts
    .filter(alert => alert.on)
    .map(alert => alert.at);

  const countTriggerReached = triggerCountValues.includes(count.value);

  useEffect(() => {
    if (!prevSavedCountsRef.current) {
      prevSavedCountsRef.current = savedCounts;
    }
  }, [savedCounts]);

  useEffect(() => {
    if (prevCountValueRef.current === count.value) {
      return;
    }

    if (!countChangeViaUserInteractionHasHappenedVar()) {
      console.log(
        'AlarmProvider: No user interaction has changed the count, skipping alert check.'
      );

      return;
    }

    if (countTriggerReached) {
      const triggeredAlert = count.alerts.find(alert => alert.at === count.value);
      setTriggeredAlert(triggeredAlert || null);
      countChangeViaUserInteractionHasHappenedVar(false);

      if (triggeredAlert && !triggeredAlert.repeat) {
        const updatedAlert = { ...triggeredAlert, on: false };
        countVar({
          ...count,
          alerts: count.alerts.map(alert => (alert.id === updatedAlert.id ? updatedAlert : alert))
        });
      }
    }

    prevCountValueRef.current = count.value;
  }, [count, countTriggerReached]);

  useEffect(() => {
    if (!countChangeViaUserInteractionHasHappenedVar()) {
      console.log(
        'AlarmProvider: No user interaction has changed the count, skipping alert check.'
      );

      return;
    }

    const valueChangedSavedCount = findValueChangedSavedCount(
      prevSavedCountsRef.current,
      savedCounts || []
    );

    if (!valueChangedSavedCount) {
      console.log('No saved count value changes detected, skipping alert check.');
      prevSavedCountsRef.current = savedCounts;
      countChangeViaUserInteractionHasHappenedVar(false);
      return;
    }

    const triggeredAlerts = valueChangedSavedCount.alerts.filter(
      alert => alert.on && alert.at === valueChangedSavedCount.value
    );

    if (triggeredAlerts.length === 0) {
      console.log('No triggered alerts found for saved counts.');
      prevSavedCountsRef.current = savedCounts;
      countChangeViaUserInteractionHasHappenedVar(false);
      return;
    }

    if (triggeredAlerts.length > 1) {
      console.error(
        'Multiple triggered alerts found for a single saved count, which should not happen.'
      );
      prevSavedCountsRef.current = savedCounts;
      countChangeViaUserInteractionHasHappenedVar(false);
      return;
    }

    const triggeredAlert = triggeredAlerts[0];
    setTriggeredAlert(triggeredAlert);
    countChangeViaUserInteractionHasHappenedVar(false);

    if (!triggeredAlert.repeat) {
      const updatedAlert = { ...triggeredAlert, on: false };
      const updatedAlerts = valueChangedSavedCount.alerts.map(alert =>
        alert.id === updatedAlert.id ? updatedAlert : alert
      );

      const updatedSavedCount = { ...valueChangedSavedCount, alerts: updatedAlerts };
      const updatedSavedCounts = savedCounts?.map(savedCount =>
        savedCount.id === updatedSavedCount.id ? updatedSavedCount : savedCount
      );

      savedCountsVar(updatedSavedCounts);
      prevSavedCountsRef.current = updatedSavedCounts;
      return;
    }

    prevSavedCountsRef.current = savedCounts;
  }, [savedCounts]);

  return (
    <>
      {triggeredAlert && (
        <Alarm triggeredAlert={triggeredAlert} setTriggeredAlert={setTriggeredAlert} />
      )}
      {children}
    </>
  );
};
