'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { t } from '@/lib/translations'

const statusWords = {
  en: { pass: 'PASS', review: 'REVIEW', fail: 'FAIL' },
  es: { pass: 'APROBADO', review: 'REVISAR', fail: 'NO CUMPLE' },
}

const pillStyles = {
  pass: 'bg-pass-bg text-pass',
  review: 'bg-warn-bg text-warn',
  fail: 'bg-alert-bg text-alert',
}

const cardStyles = {
  pass: 'check-pass',
  review: 'check-review',
  fail: 'check-fail',
}

const bannerStyles = {
  PASS: 'bg-pass-bg border-pass',
  REVIEW: 'bg-warn-bg border-warn',
  FAIL: 'bg-alert-bg border-alert',
}

const bannerText = {
  PASS: 'text-pass',
  REVIEW: 'text-warn',
  FAIL: 'text-alert',
}

const gate = {
  en: {
    title: 'See your full compliance report',
    body: 'Enter your email to unlock every check, its CFR citation, and the suggested fixes.',
    email: 'Work email',
    company: 'Company (optional)',
    button: 'Unlock Full Report',
    unlocking: 'Unlocking…',
    invalid: 'Please enter a valid email address.',
    privacy: 'Used only to send your report and occasional updates from Almaden Trade. No spam.',
  },
  es: {
    title: 'Vea su informe de cumplimiento completo',
    body: 'Ingrese su correo para desbloquear cada verificación, su cita del CFR y las correcciones sugeridas.',
    email: 'Correo electrónico',
    company: 'Empresa (opcional)',
    button: 'Desbloquear Informe Completo',
    unlocking: 'Desbloqueando…',
    invalid: 'Por favor ingrese un correo electrónico válido.',
    privacy: 'Se usa solo para enviar su informe y novedades ocasionales de Almaden Trade. Sin spam.',
  },
}

export default function ReportPage() {
  const router = useRouter()
  const [report, setReport] = useState(null)
  const [lang, setLang] = useState('en')
  const [frontImg, setFrontImg] = useState(null)
  const [backImg, setBackImg] = useState(null)
  const [unlocked, setUnlocked] = useState(false)
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    const stored = sessionStorage.getItem('colacheck_report')
    if (!stored) { router.push('/'); return }
    const parsed = JSON.parse(stored)
    setReport(parsed)
    setLang(sessionStorage.getItem('colacheck_lang') || parsed.lang || 'en')
    setFrontImg(sessionStorage.getItem('colacheck_front'))
    setBackImg(sessionStorage.getItem('colacheck_back'))
    if (sessionStorage.getItem('colacheck_unlocked') === 'true') setUnlocked(true)
  }, [router])

  if (!report) return null

  const T = t[lang] || t.en
  const G = gate[lang] || gate.en
  const SW = statusWords[lang] || statusWords.en
  const s = report.summary
  const status = s.overall_status

  const overallTitle = status === 'PASS' ? T.overallPass : status === 'REVIEW' ? T.overallReview : T.overallFail
  const overallSub = status === 'PASS' ? T.overallPassSub : status === 'REVIEW' ? T.overallReviewSub : T.overallFailSub

  function validEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  }

  async function handleUnlock() {
    setFormError('')
    if (!validEmail(email)) { setFormError(G.invalid); return }
    setSubmitting(true)
    try {
      await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          company,
          category: report.category,
          overallStatus: status,
          passCount: s.pass,
          totalCount: s.total_checks,
          lang,
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
    <main className="min-h-screen bg-ice/40">
      {/* Header */}
      <header className="border-b border-slate-light bg-white sticky top-0 z-20 no-print">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="flex items-baseline gap-2">
            <span className="font-display text-2xl text-navy tracking-tight">COLA<span className="text-sky">Check</span></span>
            <span className="text-xs text-slate hidden sm:inline">· {T.tagline} · Part of the Almaden Group</span>
          </button>
          <div className="flex items-center gap-3">
            {unlocked && (
              <button onClick={() => window.print()} className="text-sm text-steel border border-slate-light rounded-lg px-3 py-1.5 hover:bg-ice transition">
                {T.downloadPDF}
              </button>
            )}
            <button onClick={() => router.push('/')} className="text-sm text-steel hover:text-navy transition">
              {T.checkAnother}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Overall status banner (always visible — the hook) */}
        <div className={`rounded-2xl border-l-4 p-6 mb-8 fade-up ${bannerStyles[status]}`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className={`font-display text-2xl sm:text-3xl ${bannerText[status]}`}>{overallTitle}</h1>
              <p className="text-steel mt-1">{overallSub}</p>
            </div>
            <div className="text-right">
              <div className={`font-display text-3xl ${bannerText[status]}`}>{s.pass}/{s.total_checks}</div>
              <div className="text-xs text-slate uppercase tracking-wide">{T.checksPassed}</div>
            </div>
          </div>
          {s.overall_message && <p className="text-navy/80 text-sm mt-4 leading-relaxed">{s.overall_message}</p>}
        </div>

        {/* Body (gated behind email until unlocked) */}
        <div className="relative">
          <div className={`grid md:grid-cols-3 gap-8 ${unlocked ? '' : 'blur-sm pointer-events-none select-none'}`}>
            {/* Checks */}
            <div className="md:col-span-2">
              <h2 className="font-display text-xl text-navy mb-4">{T.complianceChecks}</h2>
              <div className="space-y-3">
                {report.checks.map((c) => (
                  <div key={c.id} className={`rounded-xl p-4 fade-up ${cardStyles[c.status]}`}>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-medium text-navy">{c.name}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${pillStyles[c.status]}`}>{SW[c.status]}</span>
                    </div>
                    {c.cfr_citation && <div className="font-mono text-xs text-steel mt-1">{c.cfr_citation}</div>}
                    {c.finding && (
                      <p className="text-sm text-navy/80 mt-2"><span className="font-semibold text-steel">{T.finding}: </span>{c.finding}</p>
                    )}
                    {c.explanation && (
                      <p className="text-sm text-navy/70 mt-1"><span className="font-semibold text-steel">{T.requirement}: </span>{c.explanation}</p>
                    )}
                    {c.suggested_fix && (
                      <div className="mt-3 bg-white border border-sky/30 rounded-lg p-3">
                        <div className="text-xs font-semibold text-sky uppercase tracking-wide mb-1">{T.suggestedFix}</div>
                        <p className="text-sm text-navy/80">{c.suggested_fix}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-light p-5">
                <div className="space-y-2 text-sm">
                  <ScoreRow color="bg-pass" label={SW.pass} value={s.pass} />
                  <ScoreRow color="bg-warn" label={SW.review} value={s.review} />
                  <ScoreRow color="bg-alert" label={SW.fail} value={s.fail} />
                </div>
              </div>

              {(frontImg || backImg) && (
                <div className="bg-white rounded-xl border border-slate-light p-5">
                  <h3 className="text-xs font-semibold text-slate uppercase tracking-wide mb-3">{T.labelsAnalyzed}</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {frontImg && <LabelThumb src={frontImg} label={T.front} />}
                    {backImg && <LabelThumb src={backImg} label={T.back} />}
                  </div>
                </div>
              )}

              {report.image_quality_note && (
                <div className="bg-warn-bg border border-warn/30 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-warn uppercase tracking-wide mb-1">{T.imageNote}</h3>
                  <p className="text-sm text-navy/70">{report.image_quality_note}</p>
                </div>
              )}

              <div className="bg-navy rounded-xl p-5 text-white">
                <h3 className="font-display text-lg mb-1">{T.needHelp}</h3>
                <p className="text-sm text-slate-light mb-4">{T.needHelpBody}</p>
                <a href="https://almadentrade.com" target="_blank" rel="noopener noreferrer" className="inline-block text-sm font-medium bg-sky hover:bg-sky-light text-white rounded-lg px-4 py-2 transition">
                  {T.contactUs}
                </a>
              </div>

              {report.disclaimer && <p className="text-xs text-slate leading-relaxed">{report.disclaimer}</p>}
            </aside>
          </div>

          {/* Email gate overlay */}
          {!unlocked && (
            <div className="absolute inset-0 flex items-start justify-center pt-10 no-print">
              <div className="bg-white rounded-2xl border border-slate-light shadow-xl p-6 sm:p-8 max-w-md w-full mx-4 fade-up">
                <h2 className="font-display text-xl text-navy mb-2">{G.title}</h2>
                <p className="text-sm text-steel mb-5">{G.body}</p>
                <div className="space-y-3">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={G.email}
                    className="w-full border border-slate-light rounded-lg px-3 py-2.5 text-navy focus:outline-none focus:border-sky"
                  />
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder={G.company}
                    className="w-full border border-slate-light rounded-lg px-3 py-2.5 text-navy focus:outline-none focus:border-sky"
                  />
                  {formError && <p className="text-sm text-alert">{formError}</p>}
                  <button
                    onClick={handleUnlock}
                    disabled={submitting}
                    className="w-full bg-sky hover:bg-steel disabled:opacity-60 text-white font-medium rounded-lg px-4 py-2.5 transition"
                  >
                    {submitting ? G.unlocking : G.button}
                  </button>
                  <p className="text-xs text-slate text-center">{G.privacy}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

function ScoreRow({ color, label, value }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`}></span>
        <span className="text-steel">{label}</span>
      </div>
      <span className="font-semibold text-navy">{value}</span>
    </div>
  )
}

function LabelThumb({ src, label }) {
  return (
    <div>
      <img src={src} alt={label} className="w-full h-28 object-contain bg-ice rounded-lg border border-slate-light p-1" />
      <div className="text-xs text-slate text-center mt-1">{label}</div>
    </div>
  )
}
