import { Count } from './types';
import { makeVar } from '@apollo/client';

export const countChangeViaUserInteractionHasHappenedVar = makeVar<boolean>(false);
export const countVar = makeVar<Count>({ alerts: [], value: 0 });
export const disableVolumeButtonCountingVar = makeVar<boolean>(false);
export const savedCountsVar = makeVar<Count[] | null>(null);
