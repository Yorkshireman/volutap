import { createContext } from 'react';

type CountingModeContextType = {
  countingWithVolumeButtons: boolean;
  setCountingWithVolumeButtons: (value: boolean) => Promise<void>;
};

export const CountingModeContext = createContext<CountingModeContextType>({
  countingWithVolumeButtons: false,
  setCountingWithVolumeButtons: async () => undefined
});
