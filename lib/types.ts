export type CheckStatus = 'pass' | 'review' | 'fail'
export type OverallStatus = 'PASS' | 'REVIEW' | 'FAIL'

export interface ComplianceCheck {
  id: string
  name: string
  status: CheckStatus
  cfr_citation: string
  finding: string
  explanation: string
  suggested_fix: string | null
}

export interface CheckSummary {
  total_checks: number
  pass: number
  review: number
  fail: number
  overall_status: OverallStatus
  overall_message: string
}

export interface ComplianceReport {
  summary: CheckSummary
  checks: ComplianceCheck[]
  image_quality_note: string | null
  disclaimer: string
  category: 'wine' | 'spirits' | 'beer'
  lang: 'en'
  analyzed_at: string
}



export interface CheckResponse {
  success: boolean
  report?: ComplianceReport
  error?: string
}
