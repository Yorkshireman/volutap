import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Count } from '../types';
import { useEffect } from 'react';

export const useFetchAndSetCurrentCountAndIdOnMount = (
  setCount: React.Dispatch<React.SetStateAction<Count>>,
  setCurrentCountId: React.Dispatch<React.SetStateAction<string | null>>
) => {
  useEffect(() => {
    (async () => {
      const currentCount = await AsyncStorage.getItem('currentCount');
      if (currentCount !== null) {
        setCount({ value: parseInt(currentCount) });
      }

      const currentCountId = await AsyncStorage.getItem('currentCountId');

      if (currentCountId !== null) {
        setCurrentCountId(currentCountId);
      }
    })();
  }, [setCount, setCurrentCountId]);
};
