'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { CheckRequest } from '@/lib/types'
import { t } from '@/lib/translations'

type Category = 'wine' | 'spirits' | 'beer'

const CATEGORIES: { id: Category; icon: string }[] = [
  { id: 'wine',    icon: '🍷' },
  { id: 'spirits', icon: '🥃' },
  { id: 'beer',    icon: '🍺' },
]

const CFR: Record<Category, string> = {
  wine:    '27 CFR Part 4',
  spirits: '27 CFR Part 5',
  beer:    '27 CFR Part 7',
}

const FAQS = [
  {
    q: 'What is a COLA?',
    a: 'A Certificate of Label Approval (COLA) is a federal authorization issued by the TTB that certifies your beverage alcohol label complies with U.S. regulations before your product can be sold in interstate commerce. It is required for wine (over 7% ABV), distilled spirits, and malt beverages.',
  },
  {
    q: 'What does COLACheck actually check?',
    a: 'COLACheck analyzes your label image against the mandatory requirements in 27 CFR Parts 4 (wine), 5 (spirits), and 7 (beer), plus Part 16 (health warning). This includes brand name, class/type designation, alcohol content, name and address, net contents, sulfite declarations, government health warning, and more — returning a pass, review, or fail verdict for each with the specific CFR citation.',
  },
  {
    q: 'How accurate is the analysis?',
    a: 'COLACheck is highly accurate for clearly visible label elements. Some checks — like whether actual sulfite levels exceed 10 ppm, or whether a vintage year percentage is correct — cannot be determined from a label image alone; these are flagged as "Review." Image quality matters: use the highest resolution image available for best results.',
  },
  {
    q: 'Is this legal advice?',
    a: 'No. COLACheck provides informational guidance based on published TTB regulations. It is not a substitute for legal advice. For complex submissions or unusual label designs, consult a qualified attorney or contact TTB directly at 1-866-927-2533.',
  },
  {
    q: 'What happens after the beta?',
    a: 'COLACheck is free during the beta period. Pricing will be introduced after beta. A separate filing service — where Almaden Trade handles your full COLA submission to TTB — is also coming soon. Beta users will be the first to know.',
  },
  {
    q: 'Who is Almaden Trade?',
    a: 'Almaden Trade is a beverage alcohol compliance and trade services company, part of the Almaden Group. COLACheck is Almaden Trade\'s free public tool for TTB label pre-screening. For full COLA filing services, visit almadentrade.com.',
  },
]

interface LabelImage { file: File; preview: string }

function UploadZone({ label, badge, badgeColor, image, dragging, inputRef, onFile, onRemove, onDragOver, onDragLeave, strings }: {
  label: string; badge: string; badgeColor: string;
  image: LabelImage | null; dragging: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  onFile: (f: File) => void; onRemove: () => void;
  onDragOver: () => void; onDragLeave: () => void;
  strings: typeof t['en'];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-mono text-steel uppercase tracking-widest">{label}</span>
        <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${badgeColor}`}>{badge}</span>
      </div>
      {image ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-light bg-ice">
          <img src={image.preview} alt={label} className="w-full max-h-52 object-contain p-3" />
          <button onClick={onRemove}
            className="absolute top-2 right-2 bg-navy/90 hover:bg-navy text-white text-xs font-mono px-2.5 py-1 rounded-lg transition-colors">
            {strings.remove}
          </button>
          <div className="border-t border-slate-light px-3 py-2 bg-white flex justify-between items-center">
            <span className="text-xs font-mono text-steel truncate max-w-[160px]">{image.file.name}</span>
            <span className="text-xs font-mono text-steel ml-2">{(image.file.size/1024).toFixed(0)} KB</span>
          </div>
        </div>
      ) : (
        <div
          onDrop={(e) => { e.preventDefault(); onDragLeave(); const f = e.dataTransfer.files[0]; if(f) onFile(f); }}
          onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`drop-zone rounded-xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center py-9 px-6 text-center transition-all duration-200 ${dragging ? 'active border-sky bg-ice' : 'border-slate-light hover:border-sky hover:bg-ice'}`}
        >
          <div className="w-10 h-10 rounded-full border border-slate-light flex items-center justify-center mb-3">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-sky">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-navy mb-0.5">{strings.dropHere}</p>
          <p className="text-xs text-steel">{strings.browseFiles} · {strings.fileTypes}</p>
          <p className="text-xs font-mono text-steel mt-1">{strings.minSize}</p>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp"
        onChange={(e) => { const f = e.target.files?.[0]; if(f) onFile(f); }} className="hidden" />
    </div>
  )
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-slate-light last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-4 text-left gap-4 hover:text-sky transition-colors"
      >
        <span className="font-semibold text-navy text-sm">{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
          className={`shrink-0 text-steel transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {open && <p className="text-sm text-steel leading-relaxed pb-4">{a}</p>}
    </div>
  )
}

export default function HomePage() {
  const router = useRouter()
  const frontRef = useRef<HTMLInputElement>(null)
  const backRef  = useRef<HTMLInputElement>(null)

  const [cat,  setCat]    = useState<Category>('wine')
  const [front, setFront] = useState<LabelImage | null>(null)
  const [back,  setBack]  = useState<LabelImage | null>(null)
  const [dragF, setDragF] = useState(false)
  const [dragB, setDragB] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const strings = t.en
  const faqs = FAQS

  const readFile = useCallback((file: File, label: string): Promise<LabelImage> => {
    return new Promise((resolve, reject) => {
      if (!['image/jpeg','image/png','image/webp'].includes(file.type))
        return reject(new Error(`${label}: ${strings.invalidType}`))
      if (file.size < 150*1024)
        return reject(new Error(`${label}: ${strings.tooSmall} ${(file.size/1024).toFixed(0)} ${strings.kb}`))
      if (file.size > 10*1024*1024)
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
    catch(e) { setError(e instanceof Error ? e.message : strings.somethingWrong) }
  }, [readFile, strings])

  const handleBack = useCallback(async (f: File) => {
    setError(null)
    try { setBack(await readFile(f, strings.backLabel)) }
    catch(e) { setError(e instanceof Error ? e.message : strings.somethingWrong) }
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
      const res  = await fetch('/api/check', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) })
      const data = await res.json()
      if (!data.success) throw new Error(data.error || strings.checkFailed)
      sessionStorage.setItem('colacheck_report', JSON.stringify(data.report))
      sessionStorage.setItem('colacheck_front', front.preview)
      if (back) sessionStorage.setItem('colacheck_back', back.preview)
      else sessionStorage.removeItem('colacheck_back')
      router.push('/report')
    } catch(e) {
      setError(e instanceof Error ? e.message : strings.somethingWrong)
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-slate-light bg-white sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-3xl text-navy tracking-tight">
              COLA<span className="text-sky">Check</span>
            </span>
            <span className="text-xs font-mono bg-navy text-white px-2 py-0.5 rounded-full">{strings.beta}</span>
            <span className="text-xs font-mono bg-pass/10 text-pass border border-pass/20 px-2 py-0.5 rounded-full hidden sm:inline">
              Free during beta
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-steel">
            <span>by</span>
            <a href="https://almadentrade.com" target="_blank" rel="noopener noreferrer"
              className="text-steel hover:text-navy transition-colors font-semibold">
              Almaden Trade
            </a>
            <span>·</span>
            <span>Part of the Almaden Group</span>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Hero */}
        <div className="mb-7 fade-up">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full bg-sky"></div>
            <p className="text-xs font-mono text-steel uppercase tracking-widest">{strings.eyebrow}</p>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl text-navy leading-tight mb-2">
            {strings.headline}
          </h1>
          <p className="text-steel text-sm max-w-xl leading-relaxed">{strings.subheadline}</p>
        </div>

        {/* Category */}
        <div className="mb-6 fade-up-1">
          <label className="block text-xs font-mono text-steel uppercase tracking-widest mb-3">{strings.selectCategory}</label>
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map(({ id, icon }) => (
              <button key={id} onClick={() => setCat(id)}
                className={`relative p-3.5 rounded-xl border-2 text-left transition-all duration-150 ${
                  cat === id ? 'border-sky bg-ice shadow-sm' : 'border-slate-light bg-white hover:border-sky/50 hover:bg-ice/50'
                }`}
              >
                <span className="text-xl mb-1.5 block">{icon}</span>
                <span className="font-semibold text-navy text-sm block">{strings[id]}</span>
                <span className="text-xs font-mono text-steel mt-0.5 block">{CFR[id]}</span>
                {cat === id && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-sky" />}
              </button>
            ))}
          </div>
        </div>

        {/* Upload */}
        <div className="mb-6 fade-up-2">
          <label className="block text-xs font-mono text-steel uppercase tracking-widest mb-3">{strings.uploadImages}</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UploadZone
              label={strings.frontLabel} badge={strings.required}
              badgeColor="border-alert/30 text-alert bg-alert-bg"
              image={front} dragging={dragF} inputRef={frontRef}
              onFile={handleFront}
              onRemove={() => { setFront(null); if(frontRef.current) frontRef.current.value='' }}
              onDragOver={() => setDragF(true)} onDragLeave={() => setDragF(false)}
              strings={strings}
            />
            <UploadZone
              label={strings.backLabel} badge={strings.requiredIfHasOne}
              badgeColor="border-slate-light text-steel bg-white"
              image={back} dragging={dragB} inputRef={backRef}
              onFile={handleBack}
              onRemove={() => { setBack(null); if(backRef.current) backRef.current.value='' }}
              onDragOver={() => setDragB(true)} onDragLeave={() => setDragB(false)}
              strings={strings}
            />
          </div>
          <p className="text-xs font-mono text-steel mt-2">{strings.bothLabels}</p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 px-4 py-3 rounded-xl border border-alert/30 bg-alert-bg text-alert text-sm font-mono leading-relaxed">
            {error}
          </div>
        )}

        {/* Submit row */}
        <div className="fade-up-3 flex items-center justify-between gap-6 mb-16">
          <p className="text-xs font-mono text-steel max-w-md leading-relaxed hidden sm:block">{strings.disclaimer}</p>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-mono bg-pass/10 text-pass border border-pass/20 px-2.5 py-1.5 rounded-full sm:hidden">
              Free during beta
            </span>
            <button
              onClick={handleSubmit}
              disabled={!front || loading}
              className={`px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-150
                ${!front || loading
                  ? 'bg-slate-light text-white cursor-not-allowed'
                  : 'bg-navy text-white hover:bg-navy-light shadow-md hover:shadow-lg active:scale-95'
                }`}
            >
              {loading ? (
                <span className="flex items-center gap-2.5">
                  <svg className="spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  {strings.analyzing}
                </span>
              ) : strings.runCheck}
            </button>
          </div>
        </div>

        {/* FAQ */}
        <div className="border-t border-slate-light pt-10 mb-10">
          <h2 className="font-display text-2xl text-navy mb-6">
            Frequently Asked Questions
          </h2>
          <div className="max-w-2xl">
            {faqs.map((faq, i) => <FaqItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-light bg-white">
        <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-display text-base text-navy">COLA<span className="text-sky">Check</span></span>
              <span className="text-xs text-steel font-mono">·</span>
              <a href="https://almadentrade.com" target="_blank" rel="noopener noreferrer"
                className="text-xs text-steel hover:text-navy transition-colors font-sans">
                Almaden Trade
              </a>
              <span className="text-xs text-steel font-mono">·</span>
              <span className="text-xs text-steel font-sans">Part of the Almaden Group</span>
            </div>
            <p className="text-xs text-steel font-mono">
              Filing service coming soon.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-1">
            <a href="mailto:compliance@almadentrade.com"
              className="text-xs font-mono text-steel hover:text-navy transition-colors">
              compliance@almadentrade.com
            </a>
            <p className="text-xs text-steel font-mono">
              Free during beta · Not legal advice
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
