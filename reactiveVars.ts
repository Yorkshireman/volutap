import { Count } from './types';
import { makeVar } from '@apollo/client';

export const countChangeViaUserInteractionHasHappenedVar = makeVar<boolean>(false);
export const countsVar = makeVar<Count[] | []>([]);
export const disableVolumeButtonCountingVar = makeVar<boolean>(false);
export const savedCountsVar = makeVar<Count[] | null>(null);
