import type { Count } from '../types';

export const sanitiseCountForTracking = (count: Count) => {
  const { currentlyCounting, saved, title: _title, ...rest } = count;
  return {
    ...rest,
    currentlyCounting: Boolean(currentlyCounting),
    saved: Boolean(saved)
  };
};
