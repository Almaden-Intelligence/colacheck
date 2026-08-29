import LogoMark from '@/components/LogoMark'

export default function PageShell({ eyebrow, title, intro, updated, children }: {
  eyebrow: string
  title: string
  intro: string
  updated?: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen">
      {/* gradient masthead */}
      <div className="hero-gradient relative overflow-hidden">
        <span className="blob-1 pointer-events-none absolute -right-24 -top-40 h-[440px] w-[440px] rounded-full" />
        <span className="pointer-events-none absolute -right-[6%] top-[10%] h-[340px] w-[340px] rounded-full border-[1.5px] border-white/[.13]" />
        <span className="dot-grid pointer-events-none absolute bottom-[10%] left-0 h-[90px] w-[150px] opacity-20" />

        <div className="relative z-10 mx-auto max-w-[880px] px-9">
          <nav className="flex h-[82px] items-center justify-between gap-5">
            <a href="/" className="flex items-center gap-3">
              <LogoMark onGradient className="h-[37px] w-[37px]" />
              <span className="font-display text-[26px] font-semibold leading-none tracking-[-.03em] text-white">
                COLA<span className="text-white/[.62]">Check</span>
              </span>
            </a>
            <a href="/"
              className="rounded-full border border-white/40 px-5 py-2.5 text-[13.5px] font-medium text-white backdrop-blur transition hover:bg-white/15">
              Check a label
            </a>
          </nav>

          <div className="fade-up pb-16 pt-10">
            <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-white/[.24] bg-white/[.13] px-[15px] py-2 font-mono text-[11px] uppercase tracking-[.1em] text-white/90 backdrop-blur">
              <span className="block h-1.5 w-1.5 rounded-full bg-white" />
              {eyebrow}
            </div>
            <h1 className="mb-4 font-display text-[38px] font-bold leading-[1.05] tracking-[-.04em] text-white sm:text-[46px]">
              {title}
            </h1>
            <p className="max-w-[54ch] text-[16.5px] leading-[1.66] text-white/[.82]">{intro}</p>
            {updated && (
              <p className="mt-5 font-mono text-[11px] uppercase tracking-[.1em] text-white/55">
                Last updated {updated}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* body */}
      <div className="mx-auto max-w-[880px] px-9 py-14">
        <div className="rounded-[22px] border border-rule bg-white p-8 shadow-e2 sm:p-11">
          {children}
        </div>
      </div>

      <footer className="border-t border-rule bg-white py-8">
        <div className="mx-auto flex max-w-[880px] flex-col items-start justify-between gap-4 px-9 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-1.5">
            <span className="font-display text-[24px] font-semibold tracking-[-.03em]">
              COLA<span className="text-brand">Check</span>
            </span>
            <span className="font-mono text-[13px] text-ink-soft">Built by Almaden Studio</span>
          </div>
          <div className="flex flex-col gap-1.5 sm:items-end">
            <div className="flex gap-4 font-mono text-[13px]">
              <a href="/limitations" className="text-ink-soft transition hover:text-brand">Limitations</a>
              <a href="/terms" className="text-ink-soft transition hover:text-brand">Terms</a>
              <a href="mailto:studio@almadengroup.com" className="text-ink-soft transition hover:text-brand">Contact</a>
            </div>
            <span className="font-mono text-[13px] text-ink-soft">Free during beta · Not legal advice</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

/* shared prose atoms */
export function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 mt-10 font-display text-[23px] font-semibold tracking-[-.03em] first:mt-0">{children}</h2>
}
export function P({ children }: { children: React.ReactNode }) {
  return <p className="mb-4 text-[15px] leading-[1.75] text-ink-mid">{children}</p>
}
export function UL({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="mb-4 space-y-2.5">
      {items.map((it, i) => (
        <li key={i} className="flex gap-3 text-[15px] leading-[1.7] text-ink-mid">
          <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  )
}
export function Callout({ tone = 'brand', children }: { tone?: 'brand' | 'review'; children: React.ReactNode }) {
  const c = tone === 'review'
    ? 'border-review/25 bg-review-bg'
    : 'border-line bg-tint'
  return (
    <div className={`my-6 rounded-[14px] border ${c} px-5 py-4 text-[14.5px] leading-[1.7] text-ink-mid`}>
      {children}
    </div>
  )
}
