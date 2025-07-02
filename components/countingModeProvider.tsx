import AsyncStorage from '@react-native-async-storage/async-storage';
import { CountingModeContext } from '../contexts';
import { useEffect, useState } from 'react';

export const CountingModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [countingWithVolumeButtons, setCountingWithVolumeButtonsState] = useState(false);

  useEffect(() => {
    (async () => {
      const storedMode = await AsyncStorage.getItem('countingWithVolumeButtons');
      if (storedMode !== null) {
        setCountingWithVolumeButtons(JSON.parse(storedMode));
      }
    })();
  }, []);

  const setCountingWithVolumeButtons = async (value: boolean) => {
    setCountingWithVolumeButtonsState(value);
    await AsyncStorage.setItem('countingWithVolumeButtons', JSON.stringify(value));
  };

  return (
    <CountingModeContext
      value={{
        countingWithVolumeButtons,
        setCountingWithVolumeButtons
      }}
    >
      {children}
    </CountingModeContext>
  );
};
