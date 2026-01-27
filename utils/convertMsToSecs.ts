export const convertMsToSecs = (milliseconds: number): number => {
  return parseFloat((milliseconds / 1000).toFixed(2));
};
