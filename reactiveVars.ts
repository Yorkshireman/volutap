import { Count } from './types';
import { makeVar } from '@apollo/client';

export const disableVolumeButtonCountingVar = makeVar<boolean>(false);
export const countVar = makeVar<Count>({ alerts: [], value: 0 });
