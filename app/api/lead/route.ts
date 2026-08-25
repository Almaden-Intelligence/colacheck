import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    const { email, company, category, overallStatus, passCount, totalCount } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required.' }, { status: 400 })
    }

    // Send notification email via Zoho SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD,
      },
    })

    const categoryLabel = category === 'wine' ? 'Wine' : category === 'spirits' ? 'Distilled Spirits' : 'Malt Beverage'
    const statusEmoji = overallStatus === 'PASS' ? '✅' : overallStatus === 'REVIEW' ? '⚠️' : '❌'

    await transporter.sendMail({
      from: `"COLACheck" <${process.env.ZOHO_EMAIL}>`,
      to: 'compliance@almadentrade.com',
      subject: `🆕 New COLACheck Lead — ${email}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #0B1929; margin-bottom: 4px;">New COLACheck Lead</h2>
          <p style="color: #94A3B8; font-size: 13px; margin-top: 0;">${new Date().toLocaleString()}</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 10px 0; color: #64748B; font-size: 13px; width: 140px;">Email</td>
              <td style="padding: 10px 0; color: #0B1929; font-weight: 600;">${email}</td>
            </tr>
            ${company ? `<tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 10px 0; color: #64748B; font-size: 13px;">Company</td>
              <td style="padding: 10px 0; color: #0B1929; font-weight: 600;">${company}</td>
            </tr>` : ''}
            <tr style="border-bottom: 1px solid #E2E8F0;">
              <td style="padding: 10px 0; color: #64748B; font-size: 13px;">Category</td>
              <td style="padding: 10px 0; color: #0B1929;">${categoryLabel}</td>
            </tr>
            <tr>
              <td style="padding: 10px 0; color: #64748B; font-size: 13px;">Result</td>
              <td style="padding: 10px 0; color: #0B1929;">${statusEmoji} ${overallStatus} — ${passCount}/${totalCount} checks passed</td>
            </tr>
          </table>

          ${overallStatus === 'FAIL' ? `
          <div style="background: #FEF2F2; border-left: 4px solid #DC2626; padding: 12px 16px; border-radius: 4px; margin-bottom: 16px;">
            <p style="margin: 0; color: #DC2626; font-size: 13px; font-weight: 600;">⚡ High conversion opportunity — label has failures. Follow up with filing service offer.</p>
          </div>` : ''}

          ${overallStatus === 'REVIEW' ? `
          <div style="background: #FFFBEB; border-left: 4px solid #D97706; padding: 12px 16px; border-radius: 4px; margin-bottom: 16px;">
            <p style="margin: 0; color: #D97706; font-size: 13px; font-weight: 600;">⚠️ Label has review items — good candidate for filing service.</p>
          </div>` : ''}

          <p style="color: #94A3B8; font-size: 12px; margin-top: 24px;">COLACheck · Almaden Trade · Part of the Almaden Group</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Lead capture error:', error)
    // Don't block the user if email fails — just log it
    return NextResponse.json({ success: true, warning: 'Lead saved but notification failed.' })
  }
}
