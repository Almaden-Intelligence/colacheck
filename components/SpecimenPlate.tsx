'use client'

const CALLOUTS = [
  { tone: 'pass',  align: 'left',  top: '20%', label: 'Brand name § 4.33',     delay: '.75s' },
  { tone: 'pass',  align: 'right', top: '40%', label: 'Class/type § 4.34',     delay: '.95s' },
  { tone: 'warn',  align: 'left',  top: '60%', label: 'Sulfites — flagged',    delay: '1.15s' },
  { tone: 'alert', align: 'right', top: '80%', label: 'Health warning absent', delay: '1.35s' },
] as const

const TONE: Record<string, { text: string; dot: string }> = {
  pass:  { text: 'text-pass',  dot: 'bg-pass'  },
  warn:  { text: 'text-warn',  dot: 'bg-warn'  },
  alert: { text: 'text-alert', dot: 'bg-alert' },
}

export default function SpecimenPlate() {
  return (
    <div className="relative mx-auto w-full max-w-[420px]" aria-hidden="true">
      <div className="plate-in rounded-xl bg-white p-[15px] shadow-lift-dark">
        <div className="mb-[11px] flex justify-between px-0.5 font-mono text-[9.5px] uppercase tracking-[.11em] text-ink-soft">
          <span>Specimen · front</span><span>Wine · Part 4</span>
        </div>

        {/* label artwork + callouts pinned inside the plate */}
        <div className="relative flex h-[300px] flex-col items-center justify-center overflow-hidden rounded-[7px] px-6 text-center text-[#F2F6FA]"
          style={{ background: 'linear-gradient(168deg,#1E3A5C,#0D1B2C)' }}>
          <div className="pointer-events-none absolute inset-0"
            style={{ background: 'radial-gradient(70% 50% at 50% 0%,rgba(255,255,255,.08),transparent 70%)' }} />

          <div className="mb-[15px] font-mono text-[8.5px] uppercase tracking-[.32em] opacity-50">Estate Bottled</div>
          <div className="mb-[5px] font-display text-[32px] italic tracking-tight">Vela Roja</div>
          <div className="mb-[18px] font-display text-[16px] opacity-90">2022 · Cabernet Sauvignon</div>
          <div className="mb-[18px] h-px w-[42px] bg-white/30" />
          <div className="font-mono text-[8.5px] uppercase leading-[2.1] tracking-[.17em] opacity-60">
            Napa Valley<br />750 ML · ALC 14.2% BY VOL
          </div>

          {CALLOUTS.map((c) => (
            <span key={c.label}
              className={`callout-in absolute flex items-center gap-[6px] whitespace-nowrap rounded-full bg-white/95 px-[9px] py-[4px] font-mono text-[9px] uppercase tracking-[.04em] shadow-lift-1 backdrop-blur-sm ${TONE[c.tone].text}`}
              style={{
                top: c.top,
                animationDelay: c.delay,
                ...(c.align === 'left' ? { left: '10px' } : { right: '10px' }),
              }}>
              <span className={`h-[5px] w-[5px] shrink-0 rounded-full ${TONE[c.tone].dot}`} />
              {c.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
