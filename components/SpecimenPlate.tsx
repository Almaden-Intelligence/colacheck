'use client'

const CALLOUTS = [
  { tone: 'pass',   align: 'left',  top: '15%', label: 'Brand name § 4.33',     delay: '.8s'  },
  { tone: 'pass',   align: 'right', top: '38%', label: 'Class/type § 4.34',     delay: '1.0s' },
  { tone: 'review', align: 'left',  top: '61%', label: 'Sulfites — flagged',    delay: '1.2s' },
  { tone: 'fail',   align: 'right', top: '84%', label: 'Health warning absent', delay: '1.4s' },
] as const

const TONE: Record<string, { text: string; dot: string }> = {
  pass:   { text: 'text-[#B9F0D5]', dot: 'bg-[#5FD39B]' },
  review: { text: 'text-[#F7E1B4]', dot: 'bg-[#E9B958]' },
  fail:   { text: 'text-[#FBCFC7]', dot: 'bg-[#F1806E]' },
}

export default function SpecimenPlate() {
  return (
    <div className="plate-in mx-auto w-full max-w-[440px]" aria-hidden="true">
      <div className="rounded-[20px] bg-white/[.97] p-[15px] shadow-plate">
        <div className="mb-3 flex justify-between px-[3px] font-mono text-[9.5px] uppercase tracking-[.1em] text-ink-soft">
          <span>Specimen · front</span><span>Wine · Part 4</span>
        </div>

        <div className="paper-stock relative flex h-[312px] items-center justify-center overflow-hidden rounded-xl">
          {/* the printed label */}
          <div className="paper-sheen flex h-[84%] w-[74%] flex-col items-center justify-center rounded-sm border border-paper-rule p-[18px] text-center text-paper-ink">
            <span className="mb-[11px] grid h-[26px] w-[26px] place-items-center rounded-full border border-[rgba(120,95,60,.5)] font-label text-[13px] text-[#6B4A2E]">V</span>
            <span className="mb-[9px] font-mono text-[7.5px] uppercase tracking-[.28em] text-[#8A6C48]">Estate Bottled</span>
            <span className="mb-[3px] font-label text-[34px] font-medium leading-[1.05] tracking-[.01em] text-paper-wine">Vela Roja</span>
            <span className="mb-3 font-label text-[16px] text-[#5C4A38]">2022 · Cabernet Sauvignon</span>
            <span className="mb-3 block h-px w-[44px] bg-paper-rule" />
            <span className="font-mono text-[7.5px] uppercase leading-[2.2] tracking-[.16em] text-[#7A5F41]">
              Napa Valley<br />750 ML · ALC 14.2% BY VOL
            </span>
          </div>

          {/* annotations */}
          {CALLOUTS.map((c) => (
            <span key={c.label}
              className={`callout-in absolute flex items-center gap-1.5 whitespace-nowrap rounded-full bg-[#211E2E] px-2.5 py-[5px] font-mono text-[8.5px] uppercase tracking-[.04em] shadow-pill ${TONE[c.tone].text}`}
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
