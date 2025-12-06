import AsyncStorage from '@react-native-async-storage/async-storage';
import { countVar } from '../reactiveVars';
import type { DbCount } from '../types';
import { useReactiveVar } from '@apollo/client';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useRef } from 'react';

export const usePersistCurrentCount = () => {
  const count = useReactiveVar(countVar);
  const db = useSQLiteContext();
  const currentCountValueRef = useRef<number | null>(null);
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true;
      return;
    }

    if (currentCountValueRef.current === count.value) return;

    AsyncStorage.setItem('currentCount', JSON.stringify(count));
  }, [count, db]);
};
