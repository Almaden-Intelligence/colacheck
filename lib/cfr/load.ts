import { readFileSync } from 'fs'
import { join } from 'path'

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
