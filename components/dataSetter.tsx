import { FC, ReactNode } from 'react';
import {
  useFetchAndSetCurrentCountAndIdOnMount,
  useFetchAndSetSavedCountsOnMount,
  usePersistCurrentCount
} from '../hooks';

export const DataSetter: FC<{ children: ReactNode }> = ({ children }) => {
  useFetchAndSetCurrentCountAndIdOnMount();
  useFetchAndSetSavedCountsOnMount();
  usePersistCurrentCount();

  return <>{children}</>;
};
