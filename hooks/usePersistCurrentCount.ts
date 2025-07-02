import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

export const usePersistCurrentCount = (count: number) => {
  useEffect(() => {
    AsyncStorage.setItem('currentCount', count.toString());
  }, [count]);
};
