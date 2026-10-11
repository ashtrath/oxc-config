import type { ZodType } from 'zod'

import type { SiblingType } from './types'
import type { InternalType } from '@/types'

import { readFile } from 'node:fs/promises'
import { z } from 'zod'

import { internalA, internalB } from '@/components'
import { helper } from '~/helpers'

import { siblingAlpha, siblingBeta } from './sibling'

import './styles.css'

export const ready = Boolean(
  readFile && z && helper && internalA && internalB && siblingAlpha && siblingBeta,
)
export type { InternalType, SiblingType, ZodType }
