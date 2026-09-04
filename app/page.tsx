'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { CFR_SNAPSHOT_DISPLAY } from '@/lib/cfr/snapshot-date'
import { useRouter } from 'next/navigation'
import type { CheckRequest } from '@/lib/types'
import { t } from '@/lib/translations'
import CategoryIcon from '@/components/CategoryIcon'
import UploadIcon from '@/components/UploadIcon'
import SpecimenPlate from '@/components/SpecimenPlate'
import LogoMark from '@/components/LogoMark'

type Category = 'wine' | 'spirits' | 'beer'

const CATEGORIES: { id: Category; cfr: string; note: string }[] = [
  { id: 'wine',    cfr: 'Part 4', note: 'over 7% ABV' },
  { id: 'spirits', cfr: 'Part 5', note: 'all ABV' },
  { id: 'beer',    cfr: 'Part 7', note: 'malt-based' },
]

const STATS = [
  { k: 'Regulations',     v: '4',   unit: 'parts',   d: 'Parts 4, 5, 7 and 16 of Title 27' },
  { k: 'Coverage',        v: '3',   unit: 'classes', d: 'Wine, distilled spirits, malt beverage' },
  { k: 'Corpus revision', v: CFR_SNAPSHOT_DISPLAY, d: d: 'The eCFR issue date your label is checked against' },
]

const STEPS = [
  {
    n: '1',
    t: 'Upload your artwork',
    d: 'Pick wine, distilled spirits or malt beverage, and add your front label. The back is optional — but several mandatory items usually live there, so including it changes what we can tell you.',
  },
  {
    n: '2',
    t: 'Read against 27 CFR',
    d: 'Your label is examined against the mandatory labeling requirements for that product class — Part 4, 5 or 7, plus the Part 16 health warning — the way a reviewer would read it, element by element.',
  },
  {
    n: '3',
    t: 'Get a cited verdict on each requirement',
    d: 'Every requirement comes back Pass, Review or Fail, carrying the section it was decided under and, where something needs doing, a concrete suggested fix.',
  },
]

const VERDICTS = [
  {
    k: 'Pass',
    tone: 'pass',
    d: 'The requirement is met, and that can be confirmed from the artwork.',
  },
  {
    k: 'Review',
    tone: 'review',
    d: 'The requirement applies, but whether it is met cannot be settled from an image — sulfite levels and grape percentages are the common cases. Not a soft pass: a question handed back to you.',
  },
  {
    k: 'Fail',
    tone: 'fail',
    d: 'The requirement is clearly not met, and the label would need changing before you file.',
  },
]

const PARTS = [
  { n: '27 CFR § 4',  t: 'Wine',              d: 'Labeling and advertising of wine' },
  { n: '27 CFR § 5',  t: 'Distilled Spirits', d: 'Labeling and advertising of distilled spirits' },
  { n: '27 CFR § 7',  t: 'Malt Beverages',    d: 'Labeling and advertising of malt beverages' },
  { n: '27 CFR § 16', t: 'Health Warning',    d: 'Applies to all three classes' },
]

const FAQS = [
  { q: 'What is a COLA?',
    a: 'A Certificate of Label Approval is a federal authorization from the Alcohol and Tobacco Tax and Trade Bureau confirming that your label meets US requirements. With limited exceptions you need one before the product can be sold in interstate commerce.' },
  { q: 'Is COLACheck the same as filing?',
    a: 'No. COLACheck does not submit anything to TTB and has no connection to COLAs Online. It is a check you run on your artwork beforehand. Filing is a separate process you complete yourself through TTB.' },
  { q: 'What does it actually check?',
    a: 'The mandatory labeling requirements for your product class: brand name, class and type designation, alcohol content, name and address, net contents, country of origin where applicable, required allergen and additive disclosures, the government health warning, and general requirements around legibility, English language, and type size.' },
  { q: 'Do I need to upload the back label?',
    a: 'Not required, but recommended. The health warning and several other mandatory items are often on the back. If you only upload the front, anything that might be on the back is returned as Review rather than Fail — accurate, but less useful than a definite answer.' },
  { q: 'What does "Review" mean?',
    a: 'It means the requirement applies but cannot be settled from an image. Sulfite levels and grape percentages are the common cases. Review is not a soft pass — it is a question handed back to you.' },
  { q: 'If everything passes, will TTB approve my label?',
    a: 'Not necessarily. TTB applies judgment and internal policy beyond the published regulations. A clean report means the elements we can check are in order; it is not a prediction of the outcome.' },
  { q: 'Does it check state requirements?',
    a: 'No. Federal requirements only, under 27 CFR Parts 4, 5, 7, and 16. A federally compliant label may still be non-compliant in the state where you intend to sell it.' },
  { q: 'What image should I use?',
    a: 'The highest-resolution version you have — press-ready artwork is better than a photograph of a bottle. JPEG, PNG, or WebP, between 150 KB and 10 MB. Flat artwork beats a photo of a curved bottle, where text distorts near the edges.' },
  { q: 'What happens to my label image?',
       a: 'Your artwork is used to produce your report, and we keep it so we can check the tool\u2019s accuracy. It is never published, resold, or shown as an example, and you can ask us to delete it at any time. The privacy page has the detail.' },
  { q: 'Is it free?',
    a: 'Yes, during beta. Pricing will be introduced afterward based on real usage. Anything you run now is free.' },
  { q: 'Who made this?',
    a: 'COLACheck is built and operated by Almaden Studio.' },
  { q: 'How do I actually file a COLA?',
    a: 'Through TTB\u2019s COLAs Online system at ttbonline.gov. For questions about your submission, TTB\u2019s Alcohol Labeling and Formulation Division is reachable at 1-866-927-2533 or alfd@ttb.gov.' },
]

interface LabelImage { file: File; preview: string }

function UploadZone({ label, badge, badgeTone, image, dragging, inputRef, onFile, onRemove, onDragOver, onDragLeave, hint, strings }: {
  label: string; badge: string; badgeTone: 'req' | 'opt'
  image: LabelImage | null; dragging: boolean
  inputRef: React.RefObject<HTMLInputElement>
  onFile: (f: File) => void; onRemove: () => void
  onDragOver: () => void; onDragLeave: () => void
  hint: string; strings: typeof t['en']
}) {
  const badgeClass = badgeTone === 'req'
    ? 'text-brand bg-tint border-line'
    : 'text-ink-soft bg-ground border-rule'

  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2.5">
        <span className="font-mono text-[10.5px] uppercase tracking-[.11em] text-ink-mid">{label}</span>
        <span className={`rounded-full border px-2 py-[3px] font-mono text-[9.5px] uppercase tracking-[.05em] ${badgeClass}`}>{badge}</span>
      </div>

      {image ? (
        <div className="overflow-hidden rounded-[18px] border border-rule bg-white shadow-e1">
          <div className="relative bg-ground">
            <img src={image.preview} alt={label} className="max-h-56 w-full object-contain p-3" />
            <button onClick={onRemove}
              className="absolute right-3 top-3 rounded-full bg-ink/90 px-3 py-1 font-mono text-[10.5px] uppercase tracking-[.05em] text-white transition hover:bg-ink">
              {strings.remove}
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-rule-soft px-4 py-2.5">
            <span className="max-w-[180px] truncate font-mono text-[10.5px] text-ink-soft">{image.file.name}</span>
            <span className="ml-2 font-mono text-[10.5px] text-ink-soft">{(image.file.size / 1024).toFixed(0)} KB</span>
          </div>
        </div>
      ) : (
        <div
          role="button" tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current?.click() } }}
          onDrop={(e) => { e.preventDefault(); onDragLeave(); const f = e.dataTransfer.files[0]; if (f) onFile(f) }}
          onDragOver={(e) => { e.preventDefault(); onDragOver() }}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-[18px] border-2 border-dashed px-5 py-10 text-center transition duration-200
            ${dragging
              ? 'border-brand bg-tint shadow-e1'
              : 'border-rule bg-gradient-to-b from-white to-ground hover:-translate-y-0.5 hover:border-line hover:shadow-e1'}`}
        >
          <span className="mx-auto mb-3.5 grid h-[46px] w-[46px] place-items-center rounded-[14px] bg-tint">
            <UploadIcon className="h-5 w-5 stroke-brand" />
          </span>
          <p className="mb-1 text-sm font-semibold">{strings.dropHere}</p>
          <p className="font-mono text-[10.5px] text-ink-soft">{hint}</p>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }} className="hidden" />
    </div>
  )
}
function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="faq-item mb-2.5 overflow-hidden rounded-[14px] border border-rule bg-white shadow-e1 transition hover:shadow-e2">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="text-[14.5px] font-semibold">{q}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className="faq-chevron shrink-0 text-ink-soft transition-transform duration-200">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>
      <p className="px-5 pb-5 text-sm leading-relaxed text-ink-mid">{a}</p>
    </details>
  )
}

const INCH_MM = 25.4

const toMm = (v: string) => {
  const inches = parseFloat(v)
  if (!Number.isFinite(inches) || inches <= 0 || inches > 40) return undefined
  return inches * INCH_MM
}

export default function HomePage() {
  const router = useRouter()
  const frontRef = useRef<HTMLInputElement>(null)
  const backRef  = useRef<HTMLInputElement>(null)

  const [cat, setCat]     = useState<Category>('wine')
  const [front, setFront] = useState<LabelImage | null>(null)
  const [back, setBack]   = useState<LabelImage | null>(null)
  const [dragF, setDragF] = useState(false)
  const [dragB, setDragB] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [widthMm, setWidthMm]   = useState('')
  const [heightMm, setHeightMm] = useState('')
  const [backWidthMm, setBackWidthMm]   = useState('')
  const [backHeightMm, setBackHeightMm] = useState('')

  const ready = !!front && toMm(widthMm) !== undefined && toMm(heightMm) !== undefined

  const strings = t.en

  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!loading) { setElapsed(0); return }
    const tick = setInterval(() => setElapsed(s => s + 1), 1000)
    const guard = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', guard)
    return () => {
      clearInterval(tick)
      window.removeEventListener('beforeunload', guard)
    }
  }, [loading])

  const readFile = useCallback((file: File, label: string): Promise<LabelImage> => {
    return new Promise((resolve, reject) => {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
        return reject(new Error(`${label}: ${strings.invalidType}`))
      if (file.size < 150 * 1024)
        return reject(new Error(`${label}: ${strings.tooSmall} ${(file.size / 1024).toFixed(0)} ${strings.kb}`))
      if (file.size > 10 * 1024 * 1024)
        return reject(new Error(`${label}: ${strings.tooBig}`))
      const r = new FileReader()
      r.onload = (e) => resolve({ file, preview: e.target?.result as string })
      r.onerror = () => reject(new Error(strings.failedRead))
      r.readAsDataURL(file)
    })
  }, [strings])

  const handleFront = useCallback(async (f: File) => {
    setError(null)
    try { setFront(await readFile(f, strings.frontLabel)) }
    catch (e) { setError(e instanceof Error ? e.message : strings.somethingWrong) }
  }, [readFile, strings])

  const handleBack = useCallback(async (f: File) => {
    setError(null)
    try { setBack(await readFile(f, strings.backLabel)) }
    catch (e) { setError(e instanceof Error ? e.message : strings.somethingWrong) }
  }, [readFile, strings])

  const scrollToCheck = () => document.getElementById('check')?.scrollIntoView({ behavior: 'smooth' })

  const handleSubmit = async () => {
    if (!front) return
    setLoading(true); setError(null)
    try {
      const payload: CheckRequest = {
        category: cat,
        imageBase64: front.preview.split(',')[1],
        imageMimeType: front.file.type,
        backImageBase64: back ? back.preview.split(',')[1] : undefined,
        backImageMimeType: back ? back.file.type : undefined,
        labelWidthMm:  toMm(widthMm),
        labelHeightMm: toMm(heightMm),
        backLabelWidthMm:  back ? toMm(backWidthMm)  : undefined,
        backLabelHeightMm: back ? toMm(backHeightMm) : undefined,
      }
      const res  = await fetch('/api/check', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || strings.checkFailed)
      sessionStorage.setItem('colacheck_report', JSON.stringify(data.report))
      sessionStorage.setItem('colacheck_front', front.preview)
      if (back) sessionStorage.setItem('colacheck_back', back.preview)
      else sessionStorage.removeItem('colacheck_back')
      router.push('/report')
    } catch (e) {
      setError(e instanceof Error ? e.message : strings.somethingWrong)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen">
      {/* ---------- HERO ---------- */}
      <div className="hero-gradient relative overflow-hidden">
        <span className="blob-1 pointer-events-none absolute -right-24 -top-36 h-[520px] w-[520px] rounded-full" />
        <span className="blob-2 pointer-events-none absolute -bottom-28 left-[7%] h-[330px] w-[330px] rounded-full" />
        <span className="pointer-events-none absolute right-[4%] top-[4%] h-[400px] w-[400px] rounded-full border-[1.5px] border-white/[.16]" />
        <span className="pointer-events-none absolute right-[24%] top-[32%] h-[250px] w-[250px] rounded-full border-[1.5px] border-white/10" />
        <span className="pointer-events-none absolute -right-[8%] bottom-[-46%] h-[580px] w-[580px] rounded-full border-[1.5px] border-white/[.07]" />
        <span className="dot-grid pointer-events-none absolute bottom-[14%] left-0 h-[110px] w-[180px] opacity-20" />

        <div className="relative z-10 mx-auto max-w-[1180px] px-9">
          {/* nav */}
          <nav className="flex h-[82px] items-center justify-between gap-5">
            <a href="/" className="flex items-center gap-3">
              <LogoMark onGradient className="h-[39px] w-[39px]" />
              <span className="font-display text-[28px] font-semibold leading-none tracking-[-.03em] text-white">
                COLA<span className="text-white/[.62]">Check</span>
              </span>
            </a>
            <div className="hidden items-center gap-7 lg:flex">
              <a href="#how" className="text-sm font-medium text-white/[.84] transition hover:text-white">How it works</a>
              <a href="#parts" className="text-sm font-medium text-white/[.84] transition hover:text-white">What it checks</a>
              <a href="/limitations" className="text-sm font-medium text-white/[.84] transition hover:text-white">Limitations</a>
              <button onClick={scrollToCheck}
                className="rounded-full border border-white/40 px-5 py-2.5 text-[13.5px] font-medium text-white backdrop-blur transition hover:bg-white/15">
                Check a label
              </button>
            </div>
          </nav>

          {/* hero body */}
          <div className="grid items-center gap-14 pb-24 pt-14 lg:grid-cols-[1.04fr_.96fr]">
            <div className="fade-up">
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/[.24] bg-white/[.13] px-[15px] py-2 font-mono text-[11.5px] uppercase tracking-[.1em] text-white/90 backdrop-blur">
                <span className="block h-1.5 w-1.5 rounded-full bg-white" />
                TTB Label Pre-Screening
              </div>
              <h1 className="mb-5 font-display text-[40px] font-bold leading-[1.02] tracking-[-.042em] text-white sm:text-[50px] lg:text-[60px]">
                Catch it now,{' '}
                <span className="font-light text-white/[.76]">
                  <span className="font-semibold text-sand">before</span> a rejection.
                </span>
              </h1>
              <p className="mb-8 max-w-[48ch] text-[17px] leading-[1.66] text-white/[.82]">
                Upload your label and see every federal requirement it meets, misses, or leaves open —
                each one cited to the regulation behind it. Takes about a minute.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={scrollToCheck}
                  className="rounded-full bg-white px-[30px] py-[15px] text-[14.5px] font-semibold text-g2 shadow-[0_6px_22px_-6px_rgba(0,0,0,.35)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_-8px_rgba(0,0,0,.4)]">
                  Check a label →
                </button>
                <a href="#parts"
                  className="rounded-full border border-white/40 bg-white/[.08] px-[30px] py-[15px] text-[14.5px] font-semibold text-white backdrop-blur transition duration-200 hover:-translate-y-0.5 hover:bg-white/[.18]">
                  See what it checks
                </a>
                <span className="ml-1 font-mono text-[11px] tracking-[.04em] text-white/60">Free during beta</span>
              </div>
            </div>

            <SpecimenPlate />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1180px] px-9">
        {/* ---------- STATS ---------- */}
        <div className="relative z-20 -mt-12 grid gap-4 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.k}
              className="rounded-[18px] border border-rule bg-white p-[23px] shadow-e2 transition duration-200 ease-lift hover:-translate-y-1 hover:shadow-e3">
              <div className="mb-2.5 font-mono text-[10px] uppercase tracking-[.13em] text-ink-soft">{s.k}</div>
              <div className="mb-1.5 font-display text-[28px] font-semibold leading-none tracking-[-.035em]">
               <span className="grad-text">{s.v}</span>
                {s.unit && <span className="ml-1.5 text-[16px] font-normal text-ink-soft">{s.unit}</span>}
              </div>
              <div className="text-[12.5px] leading-snug text-ink-soft">{s.d}</div>
            </div>
          ))}
        </div>

        {/* ---------- SCOPE ---------- */}
        <div className="mt-11 grid overflow-hidden rounded-[18px] border border-rule bg-white shadow-e1 sm:grid-cols-[auto_1fr]">
          <div className="grad-panel flex min-w-[180px] flex-row items-baseline gap-2.5 px-[30px] py-[26px] text-white sm:flex-col sm:justify-center sm:gap-1.5">
            <span className="font-display text-[27px] font-semibold tracking-[-.03em]">What is this?</span>
          </div>
          <div className="px-[30px] py-[26px]">
            <p className="text-sm leading-[1.72] text-ink-mid">
              <strong className="font-semibold text-ink">COLACheck is a pre-screening tool, not an approval.</strong>{' '}
              It reads your artwork against federal labeling requirements in 27 CFR and reports what it can see.
              It cannot measure type size, verify anything not printed on the label, or check state requirements —
              and a clean result here does not mean TTB will approve your submission. It is in beta, AI-based,
              and not legal advice.
            </p>
            <a href="/limitations"
              className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[.06em] text-brand transition hover:text-g2">
              Read the full limitations
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
                strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </a>
          </div>
        </div>

        {/* ---------- CHECK PANEL ---------- */}
        <section id="check" className="my-11 scroll-mt-6 overflow-hidden rounded-[22px] border border-rule bg-white shadow-e2">
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-rule-soft px-8 py-[26px]">
            <h2 className="font-display text-[25px] font-semibold tracking-[-.03em]">Check a label</h2>
            <span className="font-mono text-[10.5px] uppercase tracking-[.08em] text-ink-soft">Two steps · about a minute</span>
          </div>

          <div className="p-8">
            <div className="mb-4 flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[.13em] text-ink-soft">
              <span className="grad-fill grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white">1</span>
              Commodity class
              <span className="h-px flex-1 bg-rule-soft" />
            </div>
            <div className="mb-8 grid gap-3.5 sm:grid-cols-3">
              {CATEGORIES.map(({ id, cfr, note }) => {
                const on = cat === id
                return (
                  <button key={id} onClick={() => setCat(id)} aria-pressed={on}
                    className={`relative rounded-[18px] border-[1.5px] p-[21px] text-left transition duration-200 ease-lift
                      ${on
                        ? 'border-transparent bg-gradient-to-br from-white to-tint shadow-[0_0_0_2px_#4A4FA8] '
                        : 'border-rule bg-white hover:-translate-y-1 hover:border-line hover:shadow-e2'}`}>
                    {on && (
                      <span className="grad-fill absolute right-[18px] top-[18px] grid h-[21px] w-[21px] place-items-center rounded-full">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round"
                          strokeLinejoin="round" className="h-2.5 w-2.5"><path d="M5 13l4 4L19 7" /></svg>
                      </span>
                    )}
                    <span className={`mb-[15px] grid h-11 w-11 place-items-center rounded-[13px] transition ${on ? 'grad-fill' : 'bg-tint'}`}>
                      <CategoryIcon category={id} className={`h-[25px] w-[22px] ${on ? 'stroke-white' : 'stroke-brand'}`} />
                    </span>
                    <span className="mb-0.5 block text-base font-semibold tracking-[-.015em]">{strings[id]}</span>
                    <span className="block font-mono text-[10.5px] text-ink-soft">{cfr} · {note}</span>
                  </button>
                )
              })}
            </div>

                        <div className="mb-4 flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[.13em] text-ink-soft">
              <span className="grad-fill grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white">2</span>
              Label dimensions
              <span className="rounded-full border border-line bg-tint px-2 py-[3px] text-[9.5px] tracking-[.1em] text-brand">Required</span>
              <span className="h-px flex-1 bg-rule-soft" />
            </div>
         
            <div className="mb-8 rounded-[18px] border border-rule bg-white p-6">
              <p className="mb-5 text-[13.5px] leading-[1.65] text-ink-soft">
                The size of the actual printed label, in inches — the artwork as it will be printed, not the bottle and
                not the image file. TTB asks for this same measurement when you upload label images to COLAs Online, so
                you may already have it. Back label dimensions are optional: give them if your product has a back label
                and you want its type size measured too.
              </p>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[.13em] text-ink-soft">Front width (in)</span>
                  <input type="number" inputMode="decimal" min="0.1" max="40" step="0.01" value={widthMm}
                    onChange={(e) => setWidthMm(e.target.value)} placeholder="e.g. 4.00"
                    className="w-full rounded-[13px] border border-rule bg-white px-4 py-3 font-mono text-[14px] text-ink outline-none transition focus:border-brand focus:shadow-[0_0_0_3px_rgba(74,79,168,.14)]" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[.13em] text-ink-soft">Front height (in)</span>
                  <input type="number" inputMode="decimal" min="0.1" max="40" step="0.01" value={heightMm}
                    onChange={(e) => setHeightMm(e.target.value)} placeholder="e.g. 5.25"
                    className="w-full rounded-[13px] border border-rule bg-white px-4 py-3 font-mono text-[14px] text-ink outline-none transition focus:border-brand focus:shadow-[0_0_0_3px_rgba(74,79,168,.14)]" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[.13em] text-ink-soft">Back width (in)</span>
                  <input type="number" inputMode="decimal" min="0.1" max="40" step="0.01" value={backWidthMm}
                    onChange={(e) => setBackWidthMm(e.target.value)} placeholder="Optional"
                    className="w-full rounded-[13px] border border-rule bg-white px-4 py-3 font-mono text-[14px] text-ink outline-none transition focus:border-brand focus:shadow-[0_0_0_3px_rgba(74,79,168,.14)]" />
                </label>
                <label className="block">
                  <span className="mb-1.5 block font-mono text-[10.5px] uppercase tracking-[.13em] text-ink-soft">Back height (in)</span>
                  <input type="number" inputMode="decimal" min="0.1" max="40" step="0.01" value={backHeightMm}
                    onChange={(e) => setBackHeightMm(e.target.value)} placeholder="Optional"
                    className="w-full rounded-[13px] border border-rule bg-white px-4 py-3 font-mono text-[14px] text-ink outline-none transition focus:border-brand focus:shadow-[0_0_0_3px_rgba(74,79,168,.14)]" />
                </label>
              </div>
                <p className="mt-5 rounded-[13px] border border-review/25 bg-review-bg px-4 py-3 text-[12.5px] leading-[1.6] text-review">
                <strong className="font-semibold">Measure, do not estimate.</strong> Take these from a ruler on the
                printed label or from your print specification. A dimension that is off by ten percent makes every
                type size we report wrong by ten percent, in the direction that makes text look bigger than it is.
              </p>
              <p className="mt-4 font-mono text-[11.5px] leading-[1.6] text-ink-soft">
                Measurement depends on each image being cropped to the label edge, with no background or bleed, and
                being flat artwork rather than a photograph of a bottle.
              </p>
            </div>
            <div className="mb-4 flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[.13em] text-ink-soft">
              <span className="grad-fill grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full text-[10px] font-semibold text-white">3</span>
              Label artwork
              <span className="h-px flex-1 bg-rule-soft" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <UploadZone
                label={strings.frontLabel} badge={strings.required} badgeTone="req"
                hint="JPEG · PNG · WebP — min 150 KB"
                image={front} dragging={dragF} inputRef={frontRef}
                onFile={handleFront}
                onRemove={() => { setFront(null); if (frontRef.current) frontRef.current.value = '' }}
                onDragOver={() => setDragF(true)} onDragLeave={() => setDragF(false)}
                strings={strings}
              />
              <UploadZone
                label={strings.backLabel} badge={strings.requiredIfHasOne} badgeTone="opt"
                hint="Analyzed together with the front"
                image={back} dragging={dragB} inputRef={backRef}
                onFile={handleBack}
                onRemove={() => { setBack(null); if (backRef.current) backRef.current.value = '' }}
                onDragOver={() => setDragB(true)} onDragLeave={() => setDragB(false)}
                strings={strings}
              />
            </div>

            {error && (
              <div role="alert" className="mt-5 rounded-[14px] border border-fail/25 bg-fail-bg px-4 py-3 font-mono text-[12.5px] leading-relaxed text-fail">
                {error}
              </div>
            )}
          </div>

                    {loading && (
            <div className="border-t border-rule-soft bg-review-bg px-8 py-4">
              <p className="max-w-[74ch] text-[13px] leading-[1.65] text-review">
                <strong className="font-semibold">Keep this tab open.</strong> A check usually takes around a minute —
                your label is read, measured, and then assessed against the regulations. The report does not exist
                anywhere until it appears on screen, so closing this tab or navigating away will lose it.
              </p>
            </div>
          )}

          <div className="flex flex-col items-stretch justify-between gap-5 border-t border-rule-soft bg-ground px-8 py-6 sm:flex-row sm:items-center">
            <p className="max-w-[52ch] text-xs leading-[1.65] text-ink-soft">
              Informational guidance drawn from published TTB regulations. Not legal advice, and not a substitute for
              TTB&rsquo;s own review. By running a check you agree to the{' '}
              <a href="/terms" className="text-brand underline underline-offset-2">terms</a>.
            </p>
              <button onClick={handleSubmit} disabled={!ready || loading}
              className={`shrink-0 rounded-full px-[30px] py-[15px] text-[14.5px] font-semibold transition duration-200
                ${!ready || loading
                  ? 'cursor-not-allowed bg-rule text-ink-soft'
                  : 'grad-fill text-white shadow-[0_6px_20px_-6px_rgba(74,79,168,.5)] hover:-translate-y-0.5 hover:shadow-[0_14px_30px_-8px_rgba(74,79,168,.55)]'}`}>
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <svg className="spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {strings.analyzing} {elapsed}s
                </span>
              ) : 'Run compliance check →'}
            </button>
          </div>
        </section>

        {/* ---------- HOW IT WORKS ---------- */}
        <section id="how" className="scroll-mt-6 pb-16 pt-2">
          <div className="mb-8">
            <h2 className="mb-2 font-display text-[31px] font-semibold tracking-[-.035em]">How it works</h2>
              <p className="text-[14.5px] leading-relaxed text-ink-soft">
              Two things you do, one thing we return. No account, no upload queue, no waiting on a human.
            </p>
          </div>

          <div className="mb-12 grid gap-4 lg:grid-cols-3">
            {STEPS.map((st) => (
              <div key={st.n}
                className="rounded-[18px] border border-rule bg-white p-6 shadow-e1 transition duration-200 ease-lift hover:-translate-y-1 hover:shadow-e3">
                <span className="grad-fill mb-4 grid h-9 w-9 place-items-center rounded-full font-display text-[15px] font-semibold text-white">
                  {st.n}
                </span>
                <div className="mb-2 text-[17px] font-semibold tracking-[-.02em]">{st.t}</div>
                <p className="text-[13.5px] leading-[1.65] text-ink-soft">{st.d}</p>
              </div>
            ))}
          </div>

          {/* the three verdicts */}
          <div className="overflow-hidden rounded-[22px] border border-rule bg-white shadow-e2">
            <div className="border-b border-rule-soft px-8 py-6">
              <h3 className="mb-1.5 font-display text-[22px] font-semibold tracking-[-.03em]">Three verdicts, not two</h3>
                <p className="text-[13.5px] leading-relaxed text-ink-soft">
                A label image cannot answer every question the regulation asks. Rather than guess, COLACheck says so —
                which is why there is a third category between pass and fail.
              </p>
            </div>
            <div className="grid divide-y divide-rule-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {VERDICTS.map((v) => (
                <div key={v.k} className="px-7 py-6">
                  <span className={`mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[.1em] ${
                    v.tone === 'pass'   ? 'border-pass/25 bg-pass-bg text-pass'
                    : v.tone === 'review' ? 'border-review/25 bg-review-bg text-review'
                    : 'border-fail/25 bg-fail-bg text-fail'}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      v.tone === 'pass' ? 'bg-pass' : v.tone === 'review' ? 'bg-review' : 'bg-fail'}`} />
                    {v.k}
                  </span>
                  <p className="text-[13.5px] leading-[1.65] text-ink-soft">{v.d}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-rule-soft bg-ground px-8 py-6">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-[.13em] text-ink-soft">On method</div>
                <p className="text-[13.5px] leading-[1.7] text-ink-mid">
                COLACheck reads your artwork using an AI model, guided by a checklist of the mandatory requirements
                for your product class. That checklist is written and maintained by hand from the text of 27 CFR —
                it is not scraped live, and it is not a general-purpose question to an AI about alcohol law. Each
                finding names the section it was decided under so you can check it against the regulation yourself.{' '}
                <a href="/limitations" className="font-medium text-brand underline underline-offset-2">
                  What this approach cannot do
                </a>{' '}is written up in full.
              </p>
            </div>
          </div>
        </section>

        {/* ---------- PARTS ---------- */}
        <section id="parts" className="scroll-mt-6 pb-16 pt-2">
          <div className="mb-8">
            <h2 className="mb-2 font-display text-[31px] font-semibold tracking-[-.035em]">What it reads against</h2>
              <p className="text-[13.5px] leading-[1.7] text-ink-mid">
              Four parts of Title 27, maintained by hand from the published regulation — so a finding can always be
              traced back to the section behind it.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {PARTS.map((p) => (
              <div key={p.n}
                className="relative overflow-hidden rounded-[18px] border border-rule bg-white p-6 shadow-e1 transition duration-200 ease-lift hover:-translate-y-1 hover:shadow-e3">
                <span className="grad-fill-h absolute inset-x-0 top-0 h-[3.5px]" />
                <div className="mb-3 font-mono text-[10.5px] tracking-[.08em] text-brand">{p.n}</div>
                <div className="mb-1 text-[17px] font-semibold tracking-[-.02em]">{p.t}</div>
                <div className="text-[12.5px] leading-snug text-ink-soft">{p.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="pb-16">
          <h2 className="mb-8 font-display text-[31px] font-semibold tracking-[-.035em]">Questions</h2>
          <div className="max-w-[740px]">
            {FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </section>
      </div>

      {/* ---------- FOOTER ---------- */}
      <footer className="border-t border-rule bg-white py-8">
        <div className="mx-auto flex max-w-[1180px] flex-col items-start justify-between gap-4 px-9 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1.5">
            <span className="font-display text-[24px] font-semibold tracking-[-.03em]">
              COLA<span className="text-brand">Check</span>
            </span>
            <span className="font-mono text-[13px] text-ink-soft">Built by Almaden Studio in California</span>
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
