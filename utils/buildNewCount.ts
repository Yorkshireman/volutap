import { Count } from '../types';
import uuid from 'react-native-uuid';

export const buildNewCount = (): Count => ({
  alerts: [],
  createdAt: new Date().toISOString(),
  currentlyCounting: 1,
  id: uuid.v4(),
  lastModified: new Date().toISOString(),
  saved: 0,
  value: 0
});
