import { CountingModeContext } from '../contexts';
import { useState } from 'react';

export const CountingModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [countingWithVolumeButtons, setCountingWithVolumeButtons] = useState(false);

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
