import { makeVar } from '@apollo/client';
import { Count, SavedCount } from './types';

export const countChangeViaUserInteractionHasHappenedVar = makeVar<boolean>(false);
export const countVar = makeVar<Count>({ alerts: [], value: 0 });
export const disableVolumeButtonCountingVar = makeVar<boolean>(false);
export const savedCountsVar = makeVar<SavedCount[] | null>(null);
