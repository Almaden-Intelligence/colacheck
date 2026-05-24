'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
export default function ReportPage() {
  const router = useRouter()
  const [report, setReport] = useState(null)
  useEffect(() => {
    const stored = sessionStorage.getItem('colacheck_report')
    if (!stored) { router.push('/'); return }
    setReport(JSON.parse(stored))
  }, [router])
  if (!report) return null
  return (
    <main className="min-h-screen bg-white p-8">
      <button onClick={() => router.push('/')} className="text-navy mb-4 block">Back</button>
      <div className="bg-blue-600 text-white rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold">{report.summary.overall_status}</h1>
        <p>{report.summary.pass}/{report.summary.total_checks} checks passed</p>
      </div>
      {report.checks.map(c => (
        <div key={c.id} className="border rounded p-4 mb-2">
          <strong>{c.name}</strong> — {c.status.toUpperCase()}
          <p className="text-sm mt-1">{c.finding}</p>
        </div>
      ))}
    </main>
  )
}
