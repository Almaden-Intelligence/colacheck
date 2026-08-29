'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { CheckRequest } from '@/lib/types'
import { t } from '@/lib/translations'
import CategoryIcon from '@/components/CategoryIcon'
import UploadIcon from '@/components/UploadIcon'
import SpecimenPlate from '@/components/SpecimenPlate'

type Category = 'wine' | 'spirits' | 'beer'

const CATEGORIES: { id: Category; cfr: string; note: string }[] = [
  { id: 'wine',    cfr: 'Part 4', note: 'over 7% ABV' },
  { id: 'spirits', cfr: 'Part 5', note: 'all ABV' },
  { id: 'beer',    cfr: 'Part 7', note: 'malt-based' },
]

const STATS = [
  { v: '4',   unit: 'parts',   label: 'Parts 4, 5, 7 and 16 of Title 27' },
  { v: '3',   unit: 'classes', label: 'Wine, distilled spirits, malt beverage' },
  { v: '§',   unit: '',        label: 'Citation attached to every finding' },
  { v: '~25', unit: 's',       label: 'Upload to full written report' },
]

const PARTS = [
  { n: '27 CFR § 4',  t: 'Wine',              d: 'Labeling and advertising of wine' },
  { n: '27 CFR § 5',  t: 'Distilled Spirits', d: 'Labeling and advertising of distilled spirits' },
  { n: '27 CFR § 7',  t: 'Malt Beverages',    d: 'Labeling and advertising of malt beverages' },
  { n: '27 CFR § 16', t: 'Health Warning',    d: 'Health warning statement — applies to all three' },
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
    a: 'Your artwork is used to produce your report and may be retained so we can check the tool\u2019s accuracy. Individual labels are never published, resold, or shown as examples. See the terms for detail.' },
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
  hint: string
  strings: typeof t['en']
}) {
  const badgeClass = badgeTone === 'req'
    ? 'text-alert bg-alert-bg border-alert/20'
    : 'text-ink-soft bg-canvas border-rule'

  return (
    <div>
      <div className="mb-2.5 flex items-center gap-2.5">
        <span className="font-mono text-[10.5px] uppercase tracking-[.12em] text-ink-mid">{label}</span>
        <span className={`rounded-full border px-2 py-[3px] font-mono text-[9.5px] uppercase tracking-[.06em] ${badgeClass}`}>{badge}</span>
      </div>

      {image ? (
        <div className="overflow-hidden rounded-2xl border border-rule bg-white shadow-lift-1">
          <div className="relative bg-canvas">
            <img src={image.preview} alt={label} className="max-h-52 w-full object-contain p-3" />
            <button onClick={onRemove}
              className="absolute right-2.5 top-2.5 rounded-lg bg-navy/90 px-2.5 py-1 font-mono text-[11px] text-white transition hover:bg-navy">
              {strings.remove}
            </button>
          </div>
          <div className="flex items-center justify-between border-t border-rule-soft px-3.5 py-2.5">
            <span className="max-w-[170px] truncate font-mono text-[11px] text-ink-soft">{image.file.name}</span>
            <span className="ml-2 font-mono text-[11px] text-ink-soft">{(image.file.size / 1024).toFixed(0)} KB</span>
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
          className={`cursor-pointer rounded-2xl border-2 border-dashed px-5 py-9 text-center transition-all duration-200
            ${dragging
              ? 'border-sky bg-ice shadow-lift-1'
              : 'border-rule bg-gradient-to-b from-white to-canvas hover:-translate-y-0.5 hover:border-sky-light hover:shadow-lift-1'}`}
        >
          <div className="mx-auto mb-3.5 grid h-[42px] w-[42px] place-items-center rounded-xl bg-ice">
            <UploadIcon className="h-[18px] w-[18px] stroke-sky" />
          </div>
          <p className="mb-1 text-sm font-semibold text-navy">{strings.dropHere}</p>
          <p className="font-mono text-[10.5px] text-ink-soft">{hint}</p>
        </div>
      )}

      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f) }} className="hidden" />
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mb-2.5 overflow-hidden rounded-xl border border-rule bg-white shadow-lift-1 transition hover:shadow-lift-2">
      <button onClick={() => setOpen(o => !o)} aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
        <span className="text-sm font-semibold text-navy">{q}</span>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`shrink-0 text-ink-soft transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && <p className="px-5 pb-5 text-sm leading-relaxed text-ink-mid">{a}</p>}
    </div>
  )
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

  const strings = t.en

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
    <main className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-rule bg-white/[.86] backdrop-blur-lg">
        <div className="mx-auto flex h-[66px] max-w-[1120px] items-center justify-between px-8">
          <span className="font-display text-[27px] tracking-tight text-navy">
            COLA<span className="text-sky">Check</span>
          </span>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-navy px-2.5 py-[5px] font-mono text-[10.5px] uppercase tracking-[.08em] text-white">
              {strings.beta}
            </span>
            <span className="hidden rounded-full border border-pass/20 bg-pass/[.09] px-2.5 py-[5px] font-mono text-[10.5px] uppercase tracking-[.08em] text-pass sm:inline">
              Free during beta
            </span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative overflow-hidden rounded-b-[26px] bg-navy">
        <div className="mesh pointer-events-none absolute inset-0" />
        <div className="mesh-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-[1120px] items-center gap-14 px-8 pb-24 pt-[76px] text-white lg:grid-cols-[1.02fr_.98fr]">
          <div className="fade-up">
            <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/[.14] bg-white/[.07] px-3.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[.16em] text-sky-light backdrop-blur">
              <span className="pulse-ring block h-[5px] w-[5px] rounded-full bg-sky-light" />
              TTB Label Pre-Screening
            </div>
            <h1 className="mb-5 font-display text-[38px] leading-[1.07] tracking-tight sm:text-[48px] lg:text-[56px]">
              Every finding arrives with <em className="italic text-sky-light">the section it came from.</em>
            </h1>
            <p className="max-w-[46ch] text-[16.5px] leading-[1.68] text-ice/80">
              Upload your artwork. COLACheck reads it against the mandatory provisions of 27 CFR and returns a verdict
              for each requirement — cited, not asserted. What can&rsquo;t be settled from an image is said so plainly,
              rather than guessed.
            </p>
          </div>
          <SpecimenPlate />
        </div>
      </div>

      <div className="mx-auto max-w-[1120px] px-8">
        {/* Stats */}
        <div className="relative z-10 -mt-14 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label}
              className="rounded-2xl border border-rule bg-white p-5 shadow-lift-2 transition duration-200 ease-lift hover:-translate-y-1 hover:shadow-lift-3">
              <div className="mb-2 font-display text-[29px] leading-none text-navy">
                {s.v}{s.unit && <span className="ml-1 font-mono text-[11.5px] tracking-[.03em] text-ink-soft">{s.unit}</span>}
              </div>
              <div className="text-[12.5px] leading-snug text-ink-soft">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Limitations notice */}
        <div className="mt-10 rounded-2xl border border-warn/25 bg-warn-bg p-5 shadow-lift-1 sm:p-6">
          <div className="mb-2 flex items-center gap-2.5">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              strokeLinecap="round" className="shrink-0 text-warn">
              <path d="M12 8v5M12 17h.01" />
              <circle cx="12" cy="12" r="9" />
            </svg>
            <h2 className="font-mono text-[10.5px] uppercase tracking-[.14em] text-warn">Read this first</h2>
          </div>
          <p className="text-[13.5px] leading-relaxed text-ink-mid">
            <strong className="font-semibold text-navy">COLACheck is a pre-screening tool, not an approval.</strong>{' '}
            It reads your artwork against federal labeling requirements in 27 CFR and flags what it can see. It cannot
            measure type size, verify anything not printed on the label, or check state requirements — and passing here
            does not mean TTB will approve your submission. It is in beta, AI-based, and not legal advice.{' '}
            <a href="/limitations" className="font-medium text-sky underline decoration-sky/30 underline-offset-2 transition hover:decoration-sky">
              Full limitations
            </a>
          </p>
        </div>

        {/* Check card */}
        <section className="my-14 overflow-hidden rounded-[18px] border border-rule bg-white shadow-lift-2">
          <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-rule-soft px-[30px] py-[22px]">
            <h2 className="font-display text-2xl text-navy">Run a new check</h2>
            <span className="font-mono text-[10.5px] uppercase tracking-[.09em] text-ink-soft">Two steps · about a minute</span>
          </div>

          <div className="p-[30px]">
            {/* Step 1 */}
            <div className="mb-4 flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[.14em] text-ink-soft">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ice text-[10px] font-medium text-steel">1</span>
              Commodity class
              <span className="h-px flex-1 bg-rule-soft" />
            </div>
            <div className="mb-8 grid gap-3.5 sm:grid-cols-3">
              {CATEGORIES.map(({ id, cfr, note }) => {
                const on = cat === id
                return (
                  <button key={id} onClick={() => setCat(id)} aria-pressed={on}
                    className={`relative rounded-2xl border-[1.5px] p-[19px] text-left transition duration-200 ease-lift
                      ${on
                        ? 'border-sky bg-gradient-to-br from-white to-ice shadow-lift-2'
                        : 'border-rule bg-white hover:-translate-y-1 hover:border-sky-light hover:shadow-lift-2'}`}>
                    {on && (
                      <span className="absolute right-4 top-4 grid h-[19px] w-[19px] place-items-center rounded-full bg-sky">
                        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.8" strokeLinecap="round"
                          strokeLinejoin="round" className="h-2.5 w-2.5"><path d="M5 13l4 4L19 7" /></svg>
                      </span>
                    )}
                    <span className={`mb-3.5 grid h-10 w-10 place-items-center rounded-xl transition ${on ? 'bg-sky' : 'bg-ice'}`}>
                      <CategoryIcon category={id} className={`h-[23px] w-5 ${on ? 'stroke-white' : 'stroke-steel'}`} />
                    </span>
                    <span className="mb-0.5 block text-[15.5px] font-semibold tracking-tight text-navy">{strings[id]}</span>
                    <span className="block font-mono text-[10.5px] tracking-[.03em] text-ink-soft">{cfr} · {note}</span>
                  </button>
                )
              })}
            </div>

            {/* Step 2 */}
            <div className="mb-4 flex items-center gap-3 font-mono text-[10.5px] uppercase tracking-[.14em] text-ink-soft">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-ice text-[10px] font-medium text-steel">2</span>
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
              <div role="alert" className="mt-5 rounded-xl border border-alert/25 bg-alert-bg px-4 py-3 font-mono text-[12.5px] leading-relaxed text-alert">
                {error}
              </div>
            )}
          </div>

          <div className="flex flex-col items-stretch justify-between gap-5 border-t border-rule-soft bg-canvas px-[30px] py-[22px] sm:flex-row sm:items-center">
            <p className="max-w-[50ch] text-xs leading-relaxed text-ink-soft">
              Informational guidance drawn from published TTB regulations. Not legal advice, and not a substitute for
              TTB&rsquo;s own review. By running a check you agree to the{' '}
              <a href="/terms" className="text-sky underline decoration-sky/30 underline-offset-2 transition hover:decoration-sky">terms</a>.
            </p>
            <button onClick={handleSubmit} disabled={!front || loading}
              className={`shrink-0 rounded-xl px-[30px] py-[15px] text-[14.5px] font-semibold tracking-tight transition duration-200
                ${!front || loading
                  ? 'cursor-not-allowed bg-slate-light text-white'
                  : 'bg-navy text-white shadow-lift-1 hover:-translate-y-0.5 hover:bg-navy-light hover:shadow-lift-2'}`}>
              {loading ? (
                <span className="flex items-center justify-center gap-2.5">
                  <svg className="spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  {strings.analyzing}
                </span>
              ) : 'Run compliance check →'}
            </button>
          </div>
        </section>

        {/* Corpus */}
        <section className="pb-16">
          <div className="mb-8 text-center">
            <h2 className="mb-2 font-display text-[30px] text-navy">What it reads against</h2>
            <p className="mx-auto max-w-[58ch] text-[14.5px] leading-relaxed text-ink-soft">
              Four parts of Title 27, maintained by hand from the published regulation — so a finding can always be
              traced back to the section behind it.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {PARTS.map((p) => (
              <div key={p.n}
                className="relative overflow-hidden rounded-2xl border border-rule bg-white p-[22px] shadow-lift-1 transition duration-200 ease-lift hover:-translate-y-1 hover:shadow-lift-3">
                <span className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-sky to-sky-light" />
                <div className="mb-3 font-mono text-[10.5px] tracking-[.09em] text-sky">{p.n}</div>
                <div className="mb-1 text-[17px] font-semibold tracking-tight text-navy">{p.t}</div>
                <div className="text-[12.5px] leading-snug text-ink-soft">{p.d}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="pb-16">
          <div className="mb-8 text-center">
            <h2 className="font-display text-[30px] text-navy">Questions</h2>
          </div>
          <div className="mx-auto max-w-[720px]">
            {FAQS.map((f) => <FaqItem key={f.q} q={f.q} a={f.a} />)}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="border-t border-rule bg-white py-7">
        <div className="mx-auto flex max-w-[1120px] flex-col items-start justify-between gap-3 px-8 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1">
            <span className="font-display text-[17px] text-navy">COLA<span className="text-sky">Check</span></span>
            <span className="font-mono text-[11px] text-ink-soft">Built by Almaden Studio</span>
          </div>
          <div className="flex flex-col gap-1 sm:items-end">
            <div className="flex items-center gap-3 font-mono text-[11px] text-ink-soft">
              <a href="/limitations" className="transition hover:text-navy">Limitations</a>
              <span className="text-rule">·</span>
              <a href="/terms" className="transition hover:text-navy">Terms</a>
              <span className="text-rule">·</span>
              <a href="mailto:info@almadengroup.com" className="transition hover:text-navy">Contact</a>
            </div>
            <span className="font-mono text-[11px] text-ink-soft">Free during beta · Not legal advice</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
