import { Alarm } from './alarm';
import { useReactiveVar } from '@apollo/client';
import { useUpdateSavedCountOnCountChange } from '../hooks';
import { Alert, Count } from '../types';
import { countChangeViaUserInteractionHasHappenedVar, countsVar } from '../reactiveVars';
import { ReactNode, useEffect, useRef, useState } from 'react';

export const AlarmProvider = ({ children }: { children: ReactNode }) => {
  // const count = useReactiveVar(countVar);
  // const countChangeViaUserInteractionHasHappened = useReactiveVar(
  //   countChangeViaUserInteractionHasHappenedVar
  // );

  // const prevCountValueRef = useRef<number | undefined>(undefined);
  // useUpdateSavedCountOnCountChange();
  // const [triggeredAlert, setTriggeredAlert] = useState<Alert | null>(null);
  // const triggerCountValues: Count['value'][] = count.alerts
  //   .filter(alert => alert.on)
  //   .map(alert => alert.at);

  // const countTriggerReached = triggerCountValues.includes(count.value);

  // useEffect(() => {
  //   if (prevCountValueRef.current === count.value) {
  //     return;
  //   }

  //   if (!countChangeViaUserInteractionHasHappened) {
  //     console.log(
  //       'AlarmProvider: No user interaction has changed the count, skipping alert check.'
  //     );

  //     return;
  //   }

  //   if (countTriggerReached) {
  //     const triggeredAlert = count.alerts.find(alert => alert.at === count.value);
  //     setTriggeredAlert(triggeredAlert || null);

  //     if (triggeredAlert && !triggeredAlert.repeat) {
  //       const updatedAlert = { ...triggeredAlert, on: false };
  //       countVar({
  //         ...count,
  //         alerts: count.alerts.map(alert => (alert.id === updatedAlert.id ? updatedAlert : alert))
  //       });
  //     }
  //   }

  //   prevCountValueRef.current = count.value;
  // }, [count, countChangeViaUserInteractionHasHappened, countTriggerReached]);

  // return (
  //   <>
  //     {triggeredAlert && (
  //       <Alarm triggeredAlert={triggeredAlert} setTriggeredAlert={setTriggeredAlert} />
  //     )}
  //     {children}
  //   </>
  // );

  return <>{children}</>;
};
