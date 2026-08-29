type Props = { category: 'wine' | 'spirits' | 'beer'; className?: string }

const PATHS: Record<Props['category'], string> = {
  wine:    'M7 2h10v7a5 5 0 01-5 5 5 5 0 01-5-5V2zM12 14v9M8 23h8',
  spirits: 'M5 3h14l-1.5 18a2 2 0 01-2 2H8.5a2 2 0 01-2-2L5 3zM5.6 10h12.8',
  beer:    'M6 8h11v14a2 2 0 01-2 2H8a2 2 0 01-2-2V8zM17 11h2.5a1.5 1.5 0 011.5 1.5v4a1.5 1.5 0 01-1.5 1.5H17M8 8V5a3 3 0 013-3h1a3 3 0 013 3v3',
}

export default function CategoryIcon({ category, className = '' }: Props) {
  return (
    <svg viewBox="0 0 24 28" fill="none" strokeWidth={1.35}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={PATHS[category]} />
    </svg>
  )
}
