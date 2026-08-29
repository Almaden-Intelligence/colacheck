export default function LogoMark({ className = '', onGradient = false }: { className?: string; onGradient?: boolean }) {
  return (
    <span
      className={`grid place-items-center rounded-xl ${
        onGradient ? 'border border-white/30 bg-white/[.16] backdrop-blur' : 'grad-fill'
      } ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3}
        strokeLinecap="round" strokeLinejoin="round" className="h-1/2 w-1/2">
        <path d="M5 13l4.5 4.5L19 7" />
      </svg>
    </span>
  )
}
