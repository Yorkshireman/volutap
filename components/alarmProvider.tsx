import { Alarm } from './alarm';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert, TrackingEventNames } from '../types';
import { countChangeViaUserInteractionHasHappenedVar, countsVar } from '../reactiveVars';
import { ReactNode, useEffect, useRef, useState } from 'react';
import { sanitiseCountForTracking, track, updateCountInDb } from '../utils';

export const AlarmProvider = ({ children }: { children: ReactNode }) => {
  const counts = useReactiveVar(countsVar);
  const countChangeViaUserInteractionHasHappened = useReactiveVar(
    countChangeViaUserInteractionHasHappenedVar
  );

  const db = useSQLiteContext();
  const prevCountValueRef = useRef<number | undefined>(undefined);
  const [triggeredAlert, setTriggeredAlert] = useState<Alert | null>(null);

  useEffect(() => {
    const count = counts.find(c => c.currentlyCounting);

    if (!count || prevCountValueRef.current === count.value) {
      return;
    }

    if (!countChangeViaUserInteractionHasHappened) {
      console.log(
        'AlarmProvider: No user interaction has changed the count, skipping alert check.'
      );

      return;
    }

    const triggerCountValues = count.alerts.filter(alert => alert.on).map(alert => alert.at);
    const countTriggerReached = triggerCountValues.includes(count.value);

    if (countTriggerReached) {
      const triggeredAlert = count.alerts.find(alert => alert.at === count.value)!;
      setTriggeredAlert(triggeredAlert);
      track(
        TrackingEventNames.ALERT_TRIGGERED,
        {
          alert: triggeredAlert,
          count: sanitiseCountForTracking(count)
        },
        'alarmProvider.tsx'
      );

      if (!triggeredAlert.repeat) {
        const updatedAlert = { ...triggeredAlert, on: false };
        const updatedCount = {
          ...count,
          alerts: count.alerts.map(alert => (alert.id === updatedAlert.id ? updatedAlert : alert))
        };

        const updatedCounts = counts.map(c => (c.id === updatedCount.id ? updatedCount : c));
        const originalCounts = counts;
        countsVar(updatedCounts);
        updatedCount.saved &&
          updateCountInDb({ db, errorCallback: () => countsVar(originalCounts), updatedCount });
      }
    }

    prevCountValueRef.current = count.value;
  }, [counts, countChangeViaUserInteractionHasHappened, db]);

  return (
    <>
      {triggeredAlert && (
        <Alarm triggeredAlert={triggeredAlert} setTriggeredAlert={setTriggeredAlert} />
      )}
      {children}
    </>
  );
};
