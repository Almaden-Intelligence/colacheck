import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

type Check = {
  name?: string
  status?: 'pass' | 'review' | 'fail'
  cfr_citation?: string
  finding?: string
  explanation?: string
  suggested_fix?: string | null
}

const CATEGORY_LABEL: Record<string, string> = {
  wine: 'Wine',
  spirits: 'Distilled Spirits',
  beer: 'Malt Beverage',
}

const TONE = {
  pass:   { label: 'Pass',   color: '#2F7A57', bg: '#EFF7F2', border: '#CBE6D9' },
  review: { label: 'Review', color: '#B0770F', bg: '#FCF5E8', border: '#EEDDBC' },
  fail:   { label: 'Fail',   color: '#C4432A', bg: '#FCF0ED', border: '#F0D2CA' },
}

const esc = (v: unknown) =>
  String(v ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;')

function checkRows(checks: Check[]) {
  return checks.map((c) => {
    const t = TONE[c.status ?? 'review'] ?? TONE.review
    return `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid #EDEBF2;vertical-align:top;">
          <div style="margin-bottom:5px;">
            <span style="font-size:14px;font-weight:600;color:#191826;">${esc(c.name)}</span>
            ${c.cfr_citation ? `<span style="font-size:11px;color:#4A4FA8;background:#F2F1FB;border-radius:99px;padding:2px 8px;margin-left:7px;white-space:nowrap;">${esc(c.cfr_citation)}</span>` : ''}
            <span style="font-size:10px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;color:${t.color};background:${t.bg};border:1px solid ${t.border};border-radius:99px;padding:2px 8px;margin-left:6px;">${t.label}</span>
          </div>
          ${c.finding ? `<div style="font-size:13px;color:#54516A;line-height:1.6;">${esc(c.finding)}</div>` : ''}
          ${c.explanation ? `<div style="font-size:12.5px;color:#8A87A0;line-height:1.6;margin-top:4px;">${esc(c.explanation)}</div>` : ''}
          ${c.suggested_fix ? `<div style="font-size:12.5px;color:#54516A;line-height:1.6;margin-top:7px;padding:9px 12px;background:#FAF9FB;border-left:3px solid #4A4FA8;border-radius:5px;"><strong style="color:#191826;">Suggested fix:</strong> ${esc(c.suggested_fix)}</div>` : ''}
        </td>
      </tr>`
  }).join('')
}

function shell(inner: string) {
  return `<div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:640px;margin:0 auto;padding:28px 24px;background:#FFFFFF;">${inner}
    <p style="color:#8A87A0;font-size:11px;line-height:1.6;margin-top:28px;border-top:1px solid #EDEBF2;padding-top:16px;">
      COLACheck is a pre-screening tool, not an approval, and not legal advice. It cannot measure type size, verify
      anything not printed on the label, or check state requirements. A clean result does not mean TTB will approve
      your submission. Full limitations: https://www.colacheck.com/limitations
    </p>
  </div>`
}

export async function POST(request: NextRequest) {
  try {
    const {
      email, company, visitorType, category, overallStatus, passCount, totalCount,
      report, frontThumb, backThumb,
    } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required.' }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: { user: process.env.ZOHO_EMAIL, pass: process.env.ZOHO_PASSWORD },
    })

    const categoryLabel = CATEGORY_LABEL[category] ?? String(category ?? '')
    const checks: Check[] = Array.isArray(report?.checks) ? report.checks : []
    const t = TONE[(String(overallStatus).toLowerCase() as keyof typeof TONE)] ?? TONE.review

    const attachments: { filename: string; content: Buffer; cid: string }[] = []
    if (frontThumb) attachments.push({ filename: 'label-front.jpg', content: Buffer.from(frontThumb, 'base64'), cid: 'front' })
    if (backThumb)  attachments.push({ filename: 'label-back.jpg',  content: Buffer.from(backThumb,  'base64'), cid: 'back'  })

    const summaryBar = `
      <table style="width:100%;border-collapse:collapse;margin:18px 0 22px;">
        <tr>
          <td style="padding:14px 16px;background:${t.bg};border:1px solid ${t.border};border-radius:10px;">
            <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:${t.color};font-weight:700;margin-bottom:4px;">${t.label}</div>
            <div style="font-size:14px;color:#191826;">${esc(passCount)} of ${esc(totalCount)} checks passed · ${esc(categoryLabel)}</div>
            ${report?.summary?.overall_message ? `<div style="font-size:13px;color:#54516A;margin-top:6px;line-height:1.6;">${esc(report.summary.overall_message)}</div>` : ''}
          </td>
        </tr>
      </table>`

    const labelImages = attachments.length
      ? `<div style="margin:0 0 22px;">
          ${frontThumb ? `<img src="cid:front" alt="Front label" style="max-width:260px;border:1px solid #EDEBF2;border-radius:8px;margin-right:8px;" />` : ''}
          ${backThumb ? `<img src="cid:back" alt="Back label" style="max-width:260px;border:1px solid #EDEBF2;border-radius:8px;" />` : ''}
        </div>`
      : ''

    /* ---------- 1. the visitor's copy ---------- */
    await transporter.sendMail({
      from: `"COLACheck" <${process.env.ZOHO_EMAIL}>`,
      to: email,
      subject: `Your COLACheck report — ${categoryLabel}`,
      attachments,
      html: shell(`
        <div style="font-size:22px;font-weight:700;color:#191826;letter-spacing:-.02em;margin-bottom:2px;">Your label report</div>
        <div style="font-size:13px;color:#8A87A0;margin-bottom:4px;">${esc(categoryLabel)} · ${new Date().toLocaleDateString()}</div>
        ${summaryBar}
        ${labelImages}
        <div style="font-size:15px;font-weight:700;color:#191826;margin:0 0 4px;">Findings</div>
        <table style="width:100%;border-collapse:collapse;">${checkRows(checks)}</table>
        <p style="font-size:13px;color:#54516A;line-height:1.7;margin-top:22px;">
          Run another label any time at <a href="https://www.colacheck.com" style="color:#4A4FA8;">colacheck.com</a>.
          If you think a finding is wrong, tell us — that is the most useful thing you can send during beta.
        </p>
      `),
    })

    /* ---------- 2. internal notification ---------- */
    await transporter.sendMail({
      from: `"COLACheck" <${process.env.ZOHO_EMAIL}>`,
      to: 'studio@almadengroup.com',
      subject: `COLACheck — ${categoryLabel} — ${overallStatus} — ${email}`,
      attachments,
      html: shell(`
        <div style="font-size:20px;font-weight:700;color:#191826;margin-bottom:2px;">New check</div>
        <div style="font-size:12px;color:#8A87A0;margin-bottom:16px;">${new Date().toLocaleString()}</div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:6px;">
          <tr><td style="padding:8px 0;border-bottom:1px solid #EDEBF2;color:#8A87A0;font-size:12px;width:130px;">Email</td>
              <td style="padding:8px 0;border-bottom:1px solid #EDEBF2;color:#191826;font-weight:600;font-size:13px;">${esc(email)}</td></tr>
          ${company ? `<tr><td style="padding:8px 0;border-bottom:1px solid #EDEBF2;color:#8A87A0;font-size:12px;">Company</td>
              <td style="padding:8px 0;border-bottom:1px solid #EDEBF2;color:#191826;font-size:13px;">${esc(company)}</td></tr>` : ''}
          ${visitorType ? `<tr><td style="padding:8px 0;border-bottom:1px solid #EDEBF2;color:#8A87A0;font-size:12px;">Visitor type</td>
              <td style="padding:8px 0;border-bottom:1px solid #EDEBF2;color:#191826;font-size:13px;">${esc(visitorType)}</td></tr>` : ''}
          <tr><td style="padding:8px 0;border-bottom:1px solid #EDEBF2;color:#8A87A0;font-size:12px;">Category</td>
              <td style="padding:8px 0;border-bottom:1px solid #EDEBF2;color:#191826;font-size:13px;">${esc(categoryLabel)}</td></tr>
          <tr><td style="padding:8px 0;border-bottom:1px solid #EDEBF2;color:#8A87A0;font-size:12px;">Images</td>
              <td style="padding:8px 0;border-bottom:1px solid #EDEBF2;color:#191826;font-size:13px;">${frontThumb ? 'Front' : 'none'}${backThumb ? ' + back' : ''}</td></tr>
          ${report?.image_quality_note ? `<tr><td style="padding:8px 0;border-bottom:1px solid #EDEBF2;color:#8A87A0;font-size:12px;">Image note</td>
              <td style="padding:8px 0;border-bottom:1px solid #EDEBF2;color:#B0770F;font-size:13px;">${esc(report.image_quality_note)}</td></tr>` : ''}
        </table>
        ${summaryBar}
        ${labelImages}
        <div style="font-size:15px;font-weight:700;color:#191826;margin:0 0 4px;">Findings as returned</div>
        <table style="width:100%;border-collapse:collapse;">${checkRows(checks)}</table>
      `),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Lead API error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred.' },
      { status: 500 },
    )
  }
}
