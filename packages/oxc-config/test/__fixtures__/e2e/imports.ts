import './styles.css';
import { siblingBeta, siblingAlpha } from './sibling';
import { helper } from '~/helpers';
import { internalB, internalA } from '@/components';
import { z } from 'zod';
import { readFile } from 'node:fs/promises';
import type { SiblingType } from './types';
import type { InternalType } from '@/types';
import type { ZodType } from 'zod';

export const ready = Boolean(
  readFile && z && helper && internalA && internalB && siblingAlpha && siblingBeta,
);
export type { InternalType, SiblingType, ZodType };
