import { createContext, Dispatch, SetStateAction } from 'react';

type CountingModeContextType = {
  countingWithVolumeButtons: boolean;
  setCountingWithVolumeButtons: Dispatch<SetStateAction<boolean>>;
};

export const CountingModeContext = createContext<CountingModeContextType>({
  countingWithVolumeButtons: false,
  setCountingWithVolumeButtons: () => null
});
