import path from 'node:path'
import { guardStaleBuild } from 'tsdown-stale-guard'
import { snapshotApiPerEntry } from 'tsnapi/vitest'
import { beforeAll, describe } from 'vitest'

const root = path.resolve(import.meta.dirname, '..')

describe('public api export verification', () => {
  beforeAll(async () => {
    await guardStaleBuild({ root })
  })

  snapshotApiPerEntry(root, {
    outputDir: '__snapshots__/api',
  })
})
