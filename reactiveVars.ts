import { Count } from './types';
import { makeVar } from '@apollo/client';

export const countVar = makeVar<Count>({ alerts: [], value: 0 });
