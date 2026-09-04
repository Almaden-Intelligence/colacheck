/**
 * Deterministic corrections applied to a compliance report after the model
 * returns it.
 *
 * The model is reliable at the semantic work — recognising that a measured
 * line is the importer's name and address, and knowing the threshold that
 * applies to the container size. It is not reliable at acting on the
 * comparison: in testing it repeatedly wrote "0.8 mm, which is below the 2 mm
 * minimum" and then graded the check "review", because the surrounding text
 * describes measurements as approximate and it read that as uncertainty.
 *
 * So the model reports the figures and this file applies the rule.
 */

type Status = 'pass' | 'review' | 'fail'

interface Measurement {
  element?: string
  measured_mm?: number
  minimum_mm?: number
}

interface Check {
  id?: string
  name?: string
  status?: Status
  finding?: string
  suggested_fix?: string | null
  measurements?: Measurement[]
  [key: string]: unknown
}

interface Summary {
  total_checks?: number
  pass?: number
  review?: number
  fail?: number
  overall_status?: 'PASS' | 'REVIEW' | 'FAIL'
  overall_message?: string
  [key: string]: unknown
}

interface Report {
  summary?: Summary
  checks?: Check[]
  [key: string]: unknown
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

/**
 * True if any reported measurement in this check falls below its stated
 * minimum. Entries missing either figure are skipped rather than guessed at.
 */
function hasShortfall(check: Check): boolean {
  if (!Array.isArray(check.measurements)) return false
  return check.measurements.some(
    m => isNumber(m?.measured_mm) && isNumber(m?.minimum_mm) && m.measured_mm < m.minimum_mm
  )
}

export function enforceReportRules<T extends Report>(report: T): T {
  const checks = Array.isArray(report.checks) ? report.checks : []

  for (const check of checks) {
    // A measured height below its minimum is a failure, whatever the model
    // decided. The measurement method overstates letter height, so text that
    // already reads short is very unlikely to be compliant in print — the
    // error runs in the direction that makes the shortfall more certain, not
    // less. One short mandatory element fails the check regardless of how many
    // other elements in the same check measure fine.
    if (hasShortfall(check) && check.status !== 'fail') {
      check.status = 'fail'
    }

    // A measurement can never establish compliance, so it can never support a
    // pass. This should not occur — the prompts forbid it — but a pass here
    // would be the dangerous direction of error.
    if (check.status === 'pass' && Array.isArray(check.measurements) && check.measurements.length > 0) {
      check.status = 'review'
    }
  }

  // Recompute the counts from the checks themselves rather than trusting the
  // model's arithmetic, which is unverified and can drift from its own
  // findings.
  const pass = checks.filter(c => c.status === 'pass').length
  const review = checks.filter(c => c.status === 'review').length
  const fail = checks.filter(c => c.status === 'fail').length

  const overall_status: 'PASS' | 'REVIEW' | 'FAIL' =
    fail > 0 ? 'FAIL' : review > 0 ? 'REVIEW' : 'PASS'

  report.summary = {
    ...(report.summary || {}),
    total_checks: checks.length,
    pass,
    review,
    fail,
    overall_status,
  }

  return report
}
