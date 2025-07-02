import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

export const useFetchAndSetCurrentCountOnMount = (
  setCount: React.Dispatch<React.SetStateAction<number>>
) => {
  useEffect(() => {
    (async () => {
      const currentCount = await AsyncStorage.getItem('currentCount');
      if (currentCount !== null) {
        setCount(parseInt(currentCount));
      }
    })();
  }, [setCount]);
};
