import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

export const useFetchAndSetCurrentCountAndIdOnMount = (
  setCount: React.Dispatch<React.SetStateAction<number>>,
  setCurrentCountId: React.Dispatch<React.SetStateAction<string | null>>
) => {
  useEffect(() => {
    (async () => {
      const currentCount = await AsyncStorage.getItem('currentCount');
      if (currentCount !== null) {
        setCount(parseInt(currentCount));
      }

      const currentCountId = await AsyncStorage.getItem('currentCountId');
      console.log('in hook currentCountId: ', currentCountId);
      if (currentCountId !== null) {
        setCurrentCountId(currentCountId);
      }
    })();
  }, [setCount, setCurrentCountId]);
};
