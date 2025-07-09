import { Alarm } from './alarm';
import { countVar } from '../reactiveVars';
import { useReactiveVar } from '@apollo/client';
import { useUpdateSavedCountOnCountChange } from '../hooks';
import { Alert, Count } from '../types';
import { useEffect, useState } from 'react';

export const AlarmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const count = useReactiveVar(countVar);
  useUpdateSavedCountOnCountChange();
  const [triggeredAlert, setTriggeredAlert] = useState<Alert | null>(null);
  const triggerCountValues: Count['value'][] = count.alerts
    .filter(alert => alert.on)
    .map(alert => alert.at);

  const countTriggerReached = triggerCountValues.includes(count.value);

  useEffect(() => {
    if (countTriggerReached) {
      const triggeredAlert = count.alerts.find(alert => alert.at === count.value);
      setTriggeredAlert(triggeredAlert || null);

      if (triggeredAlert && !triggeredAlert.repeat) {
        const updatedAlert = { ...triggeredAlert, on: false };
        countVar({
          ...count,
          alerts: count.alerts.map(alert => (alert.id === updatedAlert.id ? updatedAlert : alert))
        });
      }
    }
  }, [count, countTriggerReached]);

  return (
    <>
      {triggeredAlert && (
        <Alarm triggeredAlert={triggeredAlert} setTriggeredAlert={setTriggeredAlert} />
      )}
      {children}
    </>
  );
};
