import { readFileSync } from 'fs'
import { join } from 'path'
import { CFR_SNAPSHOT_DATE } from './snapshot-date'

export type CfrCategory = 'wine' | 'spirits' | 'beer'

const CFR_DIR = join(process.cwd(), 'lib', 'cfr')

// Part 16 (health warning) applies to all three categories.
const HEALTH_WARNING = 'part-16-health-warning.md'

const FILES: Record<CfrCategory, string[]> = {
  wine:    ['part-04-wine-standards.md',   'part-04-wine-labeling.md'],
  spirits: ['part-05-spirits-labeling.md', 'part-05-spirits-standards.md'],
  beer:    ['part-07-malt-labeling.md',    'part-07-malt-standards.md'],
}

const cache: Partial<Record<CfrCategory, string>> = {}

function readCfrFile(filename: string): string {
  const path = join(CFR_DIR, filename)
  let text: string
  try {
    text = readFileSync(path, 'utf8')
  } catch {
    throw new Error(
      `CFR corpus file missing: ${filename}. Expected at lib/cfr/. ` +
      `If this appears in production but not locally, check outputFileTracingIncludes in next.config.js.`
    )
  }
  if (text.length < 5000) {
    throw new Error(`CFR corpus file looks truncated: ${filename} is only ${text.length} bytes.`)
  }

  // Every generated file carries "> Snapshot date: YYYY-MM-DD" in its header.
  // If it disagrees with CFR_SNAPSHOT_DATE, the corpus and the date the app
  // reports have drifted — most likely a re-pull where the constant was not
  // updated. Fail loudly: a stale date shown confidently is worse than a check
  // that refuses to run.
  const stamped = text.match(/^> Snapshot date: (\d{4}-\d{2}-\d{2})/m)?.[1]
  if (!stamped) {
    throw new Error(`CFR corpus file has no snapshot date in its header: ${filename}.`)
  }
  if (stamped !== CFR_SNAPSHOT_DATE) {
    throw new Error(
      `CFR corpus date mismatch: ${filename} is pinned to ${stamped}, but ` +
      `CFR_SNAPSHOT_DATE in lib/cfr/snapshot-date.ts says ${CFR_SNAPSHOT_DATE}. ` +
      `Update the constant to match the corpus, or re-pull the corpus.`
    )
  }

  return text
}

/**
 * Returns the regulation text for a category: its own part(s) plus Part 16.
 *
 * This is the authority the engine reasons from. Prompts must reference this
 * text rather than restating rules from memory — restating is what produced
 * pre-2022 Part 5 citations in the spirits prompt.
 */
export function getCfrCorpus(category: CfrCategory): string {
  const cached = cache[category]
  if (cached) return cached

  const sections = [...FILES[category], HEALTH_WARNING].map(readCfrFile)
  const corpus = sections.join('\n\n\n')
  cache[category] = corpus
  return corpus
}
