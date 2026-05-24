'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { ComplianceReport, CheckStatus } from '@/lib/types'
import { t, type Lang } from '@/lib/translations'

const STATUS = {
  pass:   { icon: '✓', badge: 'bg-pass text-white',  row: 'border-l-4 border-pass bg-pass-bg'  },
  review: { icon: '?', badge: 'bg-warn text-white',  row: 'border-l-4 border-warn bg-warn-bg'  },
  fail:   { icon: '✕', badge: 'bg-alert text-white', row: 'border-l-4 border-alert bg-alert-bg' },
}

const OVERALL = {
  PASS:   { bg: 'bg-pass',  key: 'overallPass'   as const },
  REVIEW: { bg: 'bg-warn',  key: 'overallReview' as const },
  FAIL:   { bg: 'bg-alert', key: 'overallFail'   as const },
}

const CFR_DISPLAY: Record<string, string> = {
  wine: '27 CFR Part 4', spirits: '27 CFR Part 5', beer: '27 CFR Part 7',
}

const TALLY_FORM_URL = 'https://tally.so/r/colacheck' // Update with real Tally URL once created

export default function ReportPage() {
  const router = useRouter()
  const [report, setReport]     = useState<ComplianceReport | null>(null)
  const [front,  setFront]      = useState<string | null>(null)
  const [back,   setBack]       = useState<string | null>(null)
  const [lang,   setLang]       = useState<Lang>('en')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  // Email gate state
  const [unlocked, setUnlocked]   = useState(false)
  const [email, setEmail]         = useState('')
  const [company, setCompany]     = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [gateError, setGateError] = useState<string | null>(null)

  useEffect(() => {
    const stored = sessionStorage.getItem('colacheck_report')
    if (!stored) { router.push('/'); return }
    const r: ComplianceReport = JSON.parse(stored)
    setReport(r)
    setFront(sessionStorage.getItem('colacheck_front'))
    setBack(sessionStorage.getItem('colacheck_back'))
    setLang((sessionStorage.getItem('colacheck_lang') as Lang) || 'en')
    setExpanded(new Set(r.checks.filter(c => c.status !== 'pass').map(c => c.id)))

    // Store labels in Vercel Blob
    const frontImg = sessionStorage.getItem('colacheck_front')
    const backImg  = sessionStorage.getItem('colacheck_back')
    if (frontImg) {
      fetch('/api/store-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: frontImg.split(',')[1],
          imageMimeType: frontImg.split(';')[0].split(':')[1],
          category: r.category,
          side: 'front',
          email: 'pending',
        }),
      }).catch(() => {}) // non-blocking
    }
    if (backImg) {
      fetch('/api/store-label', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: backImg.split(',')[1],
          imageMimeType: backImg.split(';')[0].split(':')[1],
          category: r.category,
          side: 'back',
          email: 'pending',
        }),
      }).catch(() => {}) // non-blocking
    }
  }, [router])

  const toggle = (id: string) => setExpanded(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
  })

  const handlePrint = () => {
    if (!report) return
    setExpanded(new Set(report.checks.map(c => c.id)))
    setTimeout(() => window.print(), 300)
  }

  const handleUnlock = async () => {
    if (!email || !email.includes('@')) {
      setGateError(strings.gateError)
      return
    }
    setSubmitting(true)
    setGateError(null)
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          company,
          category: report?.category,
          overallStatus: report?.summary.overall_status,
          passCount: report?.summary.pass,
          totalCount: report?.summary.total_checks,
          lang,
        }),
      })
    } catch {}
    setUnlocked(true)
    setSubmitting(false)
  }

  if (!report) return null

  const strings  = t[lang]
  const overall  = OVERALL[report.summary.overall_status]
  const statusOrder: Record<string, number> = { fail: 0, review: 1, pass: 2 }
  const sorted = [...report.checks].sort((a, b) => statusOrder[a.status] - statusOrder[b.status])

  return (
    <main className="min-h-screen bg-white">
        {/* Header */}
        <header className="border-b border-slate-light bg-white sticky top-0 z-20 no-print">
          <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
            <button onClick={() => router.push('/')}
              className="font-display text-xl text-navy hover:text-sky transition-colors">
              {strings.backToHome}
            </button>
            {unlocked && (
              <div className="flex items-center gap-3">
                <button onClick={handlePrint}
                  className="flex items-center gap-1.5 text-xs font-mono text-slate hover:text-navy border border-slate-light hover:border-steel px-3 py-1.5 rounded-full transition-all">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6z"/>
                  </svg>
                  {strings.print}
                </button>
                <button onClick={handlePrint}
                  className="flex items-center gap-1.5 bg-navy text-white text-xs font-mono px-3 py-1.5 rounded-full hover:bg-navy-light transition-all">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3"/>
                  </svg>
                  {strings.downloadPDF}
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="max-w-5xl mx-auto px-6 py-8">
          {/* Status banner — always visible */}
          <div className={`${overall.bg} text-white rounded-2xl p-6 mb-8 fade-up`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest opacity-75 mb-1">
                  {report.category.toUpperCase()} — {CFR_DISPLAY[report.category]}
                </p>
                <h1 className="font-display text-2xl font-bold mb-1">{strings[overall.key]}</h1>
                <p className="opacity-85 text-sm">{strings[`${overall.key}Sub` as keyof typeof strings]}</p>
                {report.summary.overall_message && (
                  <p className="mt-3 text-sm opacity-80 italic">{report.summary.overall_message}</p>
                )}
              </div>
              <div className="text-right shrink-0">
                <div className="font-display text-4xl font-bold">
                  {report.summary.pass}/{report.summary.total_checks}
                </div>
                <div className="text-xs font-mono opacity-70 mt-0.5">{strings.checksPassed}</div>
              </div>
            </div>
            <div className="mt-4 flex gap-2 text-xs font-mono flex-wrap">
              {report.summary.pass   > 0 && <span className="bg-white/20 px-2 py-1 rounded-full">{report.summary.pass} Pass</span>}
              {report.summary.review > 0 && <span className="bg-white/20 px-2 py-1 rounded-full">{report.summary.review} Review</span>}
              {report.summary.fail   > 0 && <span className="bg-white/20 px-2 py-1 rounded-full">{report.summary.fail} Fail</span>}
            </div>
          </div>

          {/* EMAIL GATE — shown when not yet unlocked */}
          {!unlocked && (
            <div className="mb-8 fade-up-1">
              {/* Blurred preview of checks */}
              <div className="relative rounded-2xl overflow-hidden mb-6">
                <div className="space-y-2 pointer-events-none select-none" style={{ filter: 'blur(4px)', opacity: 0.5 }}>
                  {sorted.slice(0, 4).map(check => {
                    const s = STATUS[check.status as CheckStatus]
                    return (
                      <div key={check.id} className={`rounded-xl overflow-hidden ${s.row} p-4 flex items-center gap-3`}>
                        <span className={`${s.badge} text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0`}>
                          {s.icon}
                        </span>
                        <span className="font-semibold text-navy text-sm">{check.name}</span>
                        <span className="text-xs font-mono text-slate ml-1">{check.cfr_citation}</span>
                      </div>
                    )
                  })}
                </div>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/60 to-white pointer-events-none" />
              </div>

              {/* Gate card */}
              <div className="max-w-md mx-auto bg-white rounded-2xl border-2 border-slate-light p-8 shadow-sm text-center">
                <div className="w-12 h-12 bg-navy rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h2 className="font-display text-xl text-navy mb-2">
                  {strings.gateTitle}
                </h2>
                <p className="text-sm text-slate mb-6 leading-relaxed">
                  {strings.gateBody}

                <div className="space-y-3 text-left">
                  <div>
                    <label className="block text-xs font-mono text-slate uppercase tracking-widest mb-1.5">
                      {strings.gateEmail}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                      placeholder={strings.gateEmailPlaceholder}
                      className="w-full border border-slate-light rounded-xl px-4 py-3 text-sm text-navy placeholder-slate-light focus:outline-none focus:border-sky transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono text-slate uppercase tracking-widest mb-1.5">
                      {strings.gateCompany}
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={e => setCompany(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleUnlock()}
                      placeholder={strings.gateCompanyPlaceholder}
                      className="w-full border border-slate-light rounded-xl px-4 py-3 text-sm text-navy placeholder-slate-light focus:outline-none focus:border-sky transition-colors"
                    />
                  </div>

                  {gateError && (
                    <p className="text-xs text-alert font-mono">{gateError}</p>
                  )}

                  <button
                    onClick={handleUnlock}
                    disabled={submitting}
                    className="w-full bg-navy text-white font-semibold text-sm py-3.5 rounded-xl hover:bg-navy-light transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {submitting
                      ? (strings.gateSubmitting)
                      : (strings.gateSubmit)}
                  </button>

                  <p className="text-xs text-slate-light text-center font-mono">
                    {strings.gateNoSpam}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* FULL REPORT — shown after email unlock */}
          {unlocked && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checks */}
              <div className="lg:col-span-2 space-y-2 fade-up-1">
                <h2 className="font-display text-lg text-navy mb-4">{strings.complianceChecks}</h2>

                {sorted.map(check => {
                  const s = STATUS[check.status as CheckStatus]
                  const open = expanded.has(check.id)
                  return (
                    <div key={check.id} className={`rounded-xl overflow-hidden ${s.row}`}>
                      <button onClick={() => toggle(check.id)}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-black/5 transition-colors no-print">
                        <div className="flex items-center gap-3">
                          <span className={`${s.badge} text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0`}>
                            {s.icon}
                          </span>
                          <div>
                            <span className="font-semibold text-navy text-sm">{check.name}</span>
                            <span className="text-xs font-mono text-slate ml-2">{check.cfr_citation}</span>
                          </div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                          className={`shrink-0 text-slate transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </button>

                      <div className="print-show p-4 flex items-center gap-3">
                        <span className={`${s.badge} text-xs font-mono font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0`}>{s.icon}</span>
                        <div>
                          <span className="font-semibold text-navy text-sm">{check.name}</span>
                          <span className="text-xs font-mono text-slate ml-2">{check.cfr_citation}</span>
                        </div>
                      </div>

                      {open && (
                        <div className="px-4 pb-4 pt-3 border-t border-black/5 space-y-3">
                          <div>
                            <p className="text-xs font-mono text-slate uppercase tracking-wide mb-1">{strings.finding}</p>
                            <p className="text-sm text-navy leading-relaxed">{check.finding}</p>
                          </div>
                          <div>
                            <p className="text-xs font-mono text-slate uppercase tracking-wide mb-1">{strings.requirement}</p>
                            <p className="text-sm text-steel leading-relaxed">{check.explanation}</p>
                          </div>
                          {check.suggested_fix && (
                            <div className="bg-white/70 rounded-lg p-3 border border-black/10">
                              <p className="text-xs font-mono text-slate uppercase tracking-wide mb-1">{strings.suggestedFix}</p>
                              <p className="text-sm text-navy font-medium leading-relaxed">{check.suggested_fix}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Sidebar */}
              <div className="space-y-5 fade-up-2">
                {(front || back) && (
                  <div>
                    <h3 className="text-xs font-mono text-slate uppercase tracking-widest mb-2">{strings.labelsAnalyzed}</h3>
                    <div className="space-y-2">
                      {front && (
                        <div className="rounded-xl overflow-hidden border border-slate-light bg-ice">
                          <p className="text-xs font-mono text-slate px-3 pt-2 pb-1">{strings.front}</p>
                          <img src={front} alt="front" className="w-full object-contain max-h-40 px-3 pb-3"/>
                        </div>
                      )}
                      {back && (
                        <div className="rounded-xl overflow-hidden border border-slate-light bg-ice">
                          <p className="text-xs font-mono text-slate px-3 pt-2 pb-1">{strings.back}</p>
                          <img src={back} alt="back" className="w-full object-contain max-h-40 px-3 pb-3"/>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {report.image_quality_note && (
                  <div className="rounded-xl border border-warn/30 bg-warn-bg p-4">
                    <p className="text-xs font-mono text-warn uppercase tracking-wide mb-1">{strings.imageNote}</p>
                    <p className="text-sm text-navy leading-relaxed">{report.image_quality_note}</p>
                  </div>
                )}

                <div className="space-y-2 no-print">
                  <button onClick={handlePrint}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-navy text-white text-sm font-semibold hover:bg-navy-light transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17v3a1 1 0 001 1h16a1 1 0 001-1v-3"/>
                    </svg>
                    {strings.downloadPDFReport}
                  </button>
                  <button onClick={() => router.push('/')}
                    className="w-full py-3 px-4 rounded-xl border-2 border-slate-light text-slate text-sm font-semibold hover:border-steel hover:text-navy transition-all">
                    {strings.checkAnother}
                  </button>
                </div>

                {/* Filing service CTA */}
                <div className="rounded-2xl bg-navy text-white p-5 no-print">
                  <p className="font-display text-base font-bold mb-2">{strings.needHelp}</p>
                  <p className="text-sm text-slate-light leading-relaxed mb-1">{strings.needHelpBody}</p>
                  <p className="text-xs font-mono text-sky mb-4">
                    {strings.filingComingSoon}
                  </p>
                  <a href={lang === 'en'
                    ? `mailto:compliance@almadentrade.com?subject=COLA Filing Inquiry&body=Hi, I just ran a COLACheck analysis (${report.category}, result: ${report.summary.overall_status}) and I'd like help with the filing. My email is ${email}.`
                    : `mailto:compliance@almadentrade.com?subject=Consulta de Presentación COLA&body=Hola, acabo de realizar un análisis COLACheck (${report.category}, resultado: ${report.summary.overall_status}) y me gustaría ayuda con la presentación. Mi correo es ${email}.`}
                    className="block w-full text-center bg-sky text-white font-semibold text-sm py-2.5 px-4 rounded-xl hover:bg-sky-light transition-colors">
                    {strings.contactUs}
                  </a>
                </div>

                <p className="text-xs font-mono text-slate-light leading-relaxed">{report.disclaimer}</p>
              </div>
            </div>
          )}
        </div>
      </main>
  )
}
