import { describe, expect, it } from 'vitest'

import * as mod from './index'

describe('oxlint-plugin-slop', () => {
  it('loads module cleanly', () => {
    expect(mod).toBeDefined()
  })
})
