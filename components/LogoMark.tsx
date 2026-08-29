export default function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden="true" className={className}>
      <rect width="40" height="40" rx="10" fill="#0B1929" />
      <path d="M11 20.5l6 6 12-13" stroke="#6BAED6" strokeWidth="3.4"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
