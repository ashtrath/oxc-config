import type { OxlintOverride } from 'oxlint'

import type { AntislopOptions } from '../types'

// TODO: Configure rules once `oxlint-plugin-slop` is published.
export function antislop(_options: AntislopOptions = {}): OxlintOverride[] {
  return []
}
