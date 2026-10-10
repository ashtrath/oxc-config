import type { Option } from '@clack/prompts'

import type { ExtraLibrariesOption, FrameworkOption } from './types'

export const FRAMEWORK_OPTIONS: Option<FrameworkOption>[] = [
  {
    label: 'React',
    value: 'react',
  },
  {
    label: 'Next.js',
    value: 'nextjs',
  },
] as const

export const EXTRA_OPTIONS: Option<ExtraLibrariesOption>[] = [
  {
    label: 'Tailwind CSS',
    value: 'tailwindcss',
  },
] as const

export const STANDARD_SCRIPTS = {
  format: 'oxfmt --write --no-error-on-unmatched-pattern',
  lint: 'oxlint',
  'lint:fix': 'oxlint --fix',
} as const

export const DEPENDENCIES_MAP = {
  tailwindcss: ['oxlint-tailwindcss'],
} as const
