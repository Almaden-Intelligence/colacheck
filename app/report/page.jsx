'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import LogoMark from '@/components/LogoMark'

const CATEGORY_LABEL = {
  wine: 'Wine · 27 CFR Part 4',
  spirits: 'Spirits · 27 CFR Part 5',
  beer: 'Malt beverage · 27 CFR Part 7',
}

const VERDICT = {
  PASS: {
    word: 'Pass',
    title: 'Nothing flagged in what we could check.',
    sub: 'Every requirement we were able to verify from your artwork is present and correctly stated. Read the caveat below before you rely on that.',
    text: 'text-pass',
    bg: 'bg-pass-bg',
    border: 'border-pass/25',
    dot: 'bg-pass',
  },
  REVIEW: {
    word: 'Review',
    title: 'Some items need answering before you file.',
    sub: 'A review is not a soft pass. It means we cannot answer the question from an image, and you must.',
    text: 'text-review',
    bg: 'bg-review-bg',
    border: 'border-review/25',
    dot: 'bg-review',
  },
  FAIL: {
    word: 'Fail',
    title: 'Mandatory requirements are missing or misstated.',
    sub: 'One or more items required by the regulation are absent from the artwork or stated incorrectly. These would need fixing before submission.',
    text: 'text-fail',
    bg: 'bg-fail-bg',
    border: 'border-fail/25',
    dot: 'bg-fail',
  },
}

const CHECK_TONE = {
  pass: { label: 'Pass', text: 'text-pass', bg: 'bg-pass-bg', border: 'border-pass/20', dot: 'bg-pass' },
  review: { label: 'Review', text: 'text-review', bg: 'bg-review-bg', border: 'border-review/20', dot: 'bg-review' },
  fail: { label: 'Fail', text: 'text-fail', bg: 'bg-fail-bg', border: 'border-fail/20', dot: 'bg-fail' },
}

const VISITOR_TYPES = ['Importer', 'Domestic producer', 'Label designer', 'Consultant', 'Other']

export default function ReportPage() {
  const router = useRouter()
  const [report, setReport] = useState(null)
  const [frontImg, setFrontImg] = useState(null)
  const [backImg, setBackImg] = useState(null)
  const [unlocked, setUnlocked] = useState(false)
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [visitorType, setVisitorType] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('colacheck_report')
    if (!stored) { router.push('/'); return }
    setReport(JSON.parse(stored))
    setFrontImg(sessionStorage.getItem('colacheck_front'))
    setBackImg(sessionStorage.getItem('colacheck_back'))
    if (sessionStorage.getItem('colacheck_unlocked') === 'true') setUnlocked(true)
  }, [router])

  if (!report) return null

  const s = report.summary
  const status = s.overall_status
  const V = VERDICT[status] || VERDICT.REVIEW
  const categoryLine = CATEGORY_LABEL[report.category] || ''

  let analyzedOn = ''
  if (report.analyzed_at) {
    try {
      analyzedOn = new Date(report.analyzed_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    } catch (e) { analyzedOn = '' }
  }

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  }

  // Shrink a data-URL image so the notification payload stays well under
  // Vercel's request body limit. Adjudication needs a legible image, not print artwork.
  function downscale(dataUrl, maxEdge = 1400, quality = 0.82) {
    return new Promise((resolve) => {
      if (!dataUrl) return resolve(null)
      try {
        const img = new Image()
        img.onload = () => {
          const scale = Math.min(1, maxEdge / Math.max(img.width, img.height))
          const w = Math.round(img.width * scale)
          const h = Math.round(img.height * scale)
          const c = document.createElement('canvas')
          c.width = w; c.height = h
          const ctx = c.getContext('2d')
          ctx.fillStyle = '#fff'
          ctx.fillRect(0, 0, w, h)
          ctx.drawImage(img, 0, 0, w, h)
          resolve(c.toDataURL('image/jpeg', quality).split(',')[1])
        }
        img.onerror = () => resolve(null)
        img.src = dataUrl
      } catch (e) {
        resolve(null)
      }
    })
  }

  async function handleUnlock() {
    setFormError('')
    if (!validEmail(email)) { setFormError('Enter a valid email address.'); return }
    setSubmitting(true)
    try {
      const [frontThumb, backThumb] = await Promise.all([
        downscale(sessionStorage.getItem('colacheck_front')),
        downscale(sessionStorage.getItem('colacheck_back')),
      ])
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          company,
          visitorType,
          category: report.category,
          overallStatus: status,
          passCount: s.pass,
          totalCount: s.total_checks,
          report,
          frontThumb,
          backThumb,
        }),
      })
    } catch (e) {
      // Never block the user if the notification email fails to send
    }
    sessionStorage.setItem('colacheck_unlocked', 'true')
    setUnlocked(true)
    setSubmitting(false)
  }

  return (
    <main className="min-h-screen">
      {/* gradient masthead */}
      <div className="hero-gradient relative overflow-hidden no-print">
        <span className="blob-1 pointer-events-none absolute -right-24 -top-40 h-[440px] w-[440px] rounded-full" />
        <span className="dot-grid pointer-events-none absolute bottom-0 left-0 h-[70px] w-[150px] opacity-20" />
        <div className="relative z-10 mx-auto max-w-[1080px] px-9">
          <nav className="flex h-[82px] items-center justify-between gap-5">
            <a href="/" className="flex items-center gap-3">
              <LogoMark onGradient className="h-[37px] w-[37px]" />
              <span className="font-display text-[26px] font-semibold leading-none tracking-[-.03em] text-white">
                COLA<span className="text-white/[.62]">Check</span>
              </span>
            </a>
            <div className="flex items-center gap-3">
              {unlocked && (
                <button
                  onClick={() => window.print()}
                  className="rounded-full border border-white/40 px-5 py-2.5 text-[13.5px] font-medium text-white backdrop-blur transition hover:bg-white/15"
                >
                  Save as PDF
                </button>
              )}
              
                href="/"
                className="rounded-full bg-white px-5 py-2.5 text-[13.5px] font-medium text-g1 shadow-pill transition hover:bg-white/90"
              >
                Check another label
              </a>
            </div>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-[1080px] px-9 py-12">
        {/* verdict banner */}
        <div className={`fade-up rounded-[22px] border ${V.border} ${V.bg} p-7 shadow-e1 sm:p-9`}>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
            <div className="max-w-[54ch]">
              <h1 className={`font-display text-[27px] font-semibold leading-[1.15] tracking-[-.03em] sm:text-[31px] ${V.text}`}>
                {V.title}
              </h1>
              <p className="mt-2.5 text-[15px] leading-[1.7] text-ink-mid">{V.sub}</p>
            </div>
            <div className="shrink-0 sm:text-right">
              <div className={`font-display text-[34px] font-bold leading-none tracking-[-.035em] ${V.text}`}>
                {V.word}
              </div>
              <div className="mt-2.5 font-mono text-[11px] uppercase tracking-[.1em] text-ink-soft">
                {categoryLine}
              </div>
              {analyzedOn && (
                <div className="mt-1 font-mono text-[11px] uppercase tracking-[.1em] text-ink-soft">
                  Checked {analyzedOn}
                </div>
              )}
            </div>
          </div>
          {s.overall_message && (
            <p className="mt-6 border-t border-ink/[.07] pt-5 text-[14.5px] leading-[1.7] text-ink-mid">
              {s.overall_message}
            </p>
          )}
        </div>

        {/* TTB reviewer discretion — always visible, never gated */}
        <div className="fade-up-1 mt-5 rounded-[14px] border border-review/25 bg-review-bg px-5 py-4 text-[14.5px] leading-[1.7] text-ink-mid">
          <strong className="font-semibold text-ink">This is not an approval, and not a prediction of one.</strong>{' '}
          COLACheck checks whether required elements are present and correctly stated on your artwork. TTB reviewers
          apply judgment, internal policy, and precedent that no published regulation fully captures. A label can clear
          every check here and still be rejected, sometimes for reasons that are not clearly written down anywhere.
          Nothing on this page forecasts what TTB will do with your submission.{' '}
          <a href="/limitations" className="font-medium text-brand underline underline-offset-2">
            Read the full limitations
          </a>.
        </div>

        {/* body */}
        <div className="relative mt-8">
          <div className={`grid gap-8 md:grid-cols-3 ${unlocked ? '' : 'pointer-events-none select-none blur-[6px]'}`}>
            {/* findings */}
            <div className="md:col-span-2">
              <h2 className="mb-4 font-display text-[23px] font-semibold tracking-[-.03em]">Findings</h2>
              <div className="space-y-3.5">
                {report.checks.map((c) => {
                  const tone = CHECK_TONE[c.status] || CHECK_TONE.review
                  return (
                    <div
                      key={c.id}
                      className={`rounded-[18px] border ${tone.border} bg-card p-5 shadow-e1 transition duration-300 ease-lift hover:-translate-y-1 hover:shadow-e2`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="font-display text-[16.5px] font-semibold tracking-[-.02em] text-ink">
                          {c.name}
                        </h3>
                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full ${tone.bg} px-2.5 py-1 font-mono text-[10.5px] uppercase tracking-[.1em] ${tone.text}`}
                        >
                          <span className={`block h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                          {tone.label}
                        </span>
                      </div>

                      {c.cfr_citation && (
                        <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[.08em] text-ink-soft">
                          {c.cfr_citation}
                        </div>
                      )}

                      {c.finding && (
                        <p className="mt-3 text-[14.5px] leading-[1.7] text-ink-mid">
                          <span className="font-mono text-[10.5px] uppercase tracking-[.1em] text-ink-soft">Finding </span>
                          {c.finding}
                        </p>
                      )}

                      {c.explanation && (
                        <p className="mt-2 text-[14.5px] leading-[1.7] text-ink-mid">
                          <span className="font-mono text-[10.5px] uppercase tracking-[.1em] text-ink-soft">Requirement </span>
                          {c.explanation}
                        </p>
                      )}

                      {c.suggested_fix && (
                        <div className="mt-4 rounded-[12px] border border-line bg-tint px-4 py-3">
                          <div className="mb-1 font-mono text-[10.5px] uppercase tracking-[.1em] text-brand">
                            Suggested fix
                          </div>
                          <p className="text-[14px] leading-[1.65] text-ink-mid">{c.suggested_fix}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* sidebar */}
            <aside className="space-y-5">
              <div className="rounded-[18px] border border-rule bg-card p-5 shadow-e1">
                <h3 className="mb-3.5 font-mono text-[10.5px] uppercase tracking-[.1em] text-ink-soft">
                  This label
                </h3>
                <div className="space-y-2.5">
                  <ScoreRow dot="bg-pass" label="Pass" value={s.pass} />
                  <ScoreRow dot="bg-review" label="Review" value={s.review} />
                  <ScoreRow dot="bg-fail" label="Fail" value={s.fail} />
                </div>
              </div>

              {(frontImg || backImg) && (
                <div className="rounded-[18px] border border-rule bg-card p-5 shadow-e1">
                  <h3 className="mb-3.5 font-mono text-[10.5px] uppercase tracking-[.1em] text-ink-soft">
                    Artwork analyzed
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {frontImg && <LabelThumb src={frontImg} label="Front" />}
                    {backImg && <LabelThumb src={backImg} label="Back" />}
                  </div>
                </div>
              )}

              {report.image_quality_note && (
                <div className="rounded-[18px] border border-review/25 bg-review-bg p-5">
                  <h3 className="mb-1.5 font-mono text-[10.5px] uppercase tracking-[.1em] text-review">
                    Image quality
                  </h3>
                  <p className="text-[14px] leading-[1.65] text-ink-mid">{report.image_quality_note}</p>
                </div>
              )}

              {report.disclaimer && (
                <p className="px-1 text-[12.5px] leading-[1.65] text-ink-soft">{report.disclaimer}</p>
              )}
            </aside>
          </div>

          {/* email gate */}
          {!unlocked && (
            <div className="no-print absolute inset-0 flex items-start justify-center pt-8">
              <div className="fade-up w-full max-w-[440px] rounded-[22px] border border-rule bg-card p-7 shadow-e3 sm:p-8">
                <div className="mb-4 inline-flex items-center gap-2.5 rounded-full border border-line bg-tint px-[13px] py-1.5 font-mono text-[10.5px] uppercase tracking-[.1em] text-brand">
                  <span className="block h-1.5 w-1.5 rounded-full bg-brand" />
                  One step left
                </div>
                <h2 className="mb-2 font-display text-[23px] font-semibold leading-[1.2] tracking-[-.03em]">
                  See every finding in full.
                </h2>
                <p className="mb-6 text-[14.5px] leading-[1.7] text-ink-mid">
                  Enter your email to open the full report — every finding, its CFR citation, and what to do about it.
                  We&rsquo;ll send you a copy to keep.
                </p>

                <div className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full rounded-[12px] border border-line bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft focus:border-brand focus:outline-none"
                  />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Company (optional)"
                    className="w-full rounded-[12px] border border-line bg-white px-4 py-3 text-[15px] text-ink placeholder:text-ink-soft focus:border-brand focus:outline-none"
                  />

                  <div className="pt-1">
                    <p className="mb-2.5 font-mono text-[10.5px] uppercase tracking-[.1em] text-ink-soft">
                      Which best describes you? (optional)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {VISITOR_TYPES.map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setVisitorType(visitorType === v ? '' : v)}
                          className={`rounded-full border px-3.5 py-1.5 text-[12.5px] transition duration-200 ease-lift ${
                            visitorType === v
                              ? 'border-brand bg-brand text-white'
                              : 'border-line text-ink-mid hover:border-brand hover:text-brand'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>

                  {formError && <p className="text-[13.5px] text-fail">{formError}</p>}

                  <button
                    onClick={handleUnlock}
                    disabled={submitting}
                    className="grad-fill-h w-full rounded-full px-5 py-3.5 text-[14.5px] font-medium text-white shadow-pill transition duration-200 ease-lift hover:-translate-y-0.5 disabled:opacity-60"
                  >
                    {submitting ? 'Opening…' : 'Open the full report'}
                  </button>

                  <p className="pt-1 text-center font-mono text-[11px] text-ink-soft">
                    Used only to send your report. No spam.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-rule bg-white py-8">
        <div className="mx-auto flex max-w-[1080px] flex-col items-start justify-between gap-4 px-9 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1.5">
            <span className="font-display text-[24px] font-semibold tracking-[-.03em]">
              COLA<span className="text-brand">Check</span>
            </span>
            <span className="font-mono text-[13px] text-ink-soft">Built by Almaden Studio</span>
            <span className="font-mono text-[11px] text-ink-soft">© {new Date().getFullYear()} Almaden Studio. All rights reserved.</span>
          </div>
          <div className="flex flex-col gap-1.5 sm:items-end">
            <div className="flex gap-4 font-mono text-[13px]">
              <a href="/limitations" className="text-ink-soft transition hover:text-brand">Limitations</a>
              <a href="/terms" className="text-ink-soft transition hover:text-brand">Terms</a>
              <a href="/privacy" className="text-ink-soft transition hover:text-brand">Privacy</a>
              <a href="mailto:studio@almadengroup.com" className="text-ink-soft transition hover:text-brand">Contact</a>
            </div>
            <span className="font-mono text-[13px] text-ink-soft">Free during beta · Not legal advice</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

function ScoreRow({ dot, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className={`block h-2 w-2 rounded-full ${dot}`} />
        <span className="text-[14px] text-ink-mid">{label}</span>
      </div>
      <span className="font-mono text-[14px] font-medium text-ink">{value}</span>
    </div>
  )
}

function LabelThumb({ src, label }) {
  return (
    <div>
      <img
        src={src}
        alt={label + ' label'}
        className="h-28 w-full rounded-[12px] border border-rule bg-ground object-contain p-1.5"
      />
      <div className="mt-1.5 text-center font-mono text-[10.5px] uppercase tracking-[.1em] text-ink-soft">
        {label}
      </div>
    </div>
  )
}
