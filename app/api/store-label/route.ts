import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    // Only store if Vercel Blob is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ success: true, warning: 'Blob storage not configured.' })
    }

    const { put } = await import('@vercel/blob')
    const { imageBase64, imageMimeType, category, side, email } = await request.json()

    if (!imageBase64 || !imageMimeType) {
      return NextResponse.json({ success: false, error: 'Image data required.' }, { status: 400 })
    }

    const buffer = Buffer.from(imageBase64, 'base64')
    const ext = imageMimeType.split('/')[1] || 'jpg'
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const emailSlug = email ? email.replace(/[@.]/g, '_') : 'anonymous'
    const filename = `labels/${category}/${timestamp}_${side}_${emailSlug}.${ext}`

    const blob = await put(filename, buffer, {
      access: 'private',
      contentType: imageMimeType,
    })

    return NextResponse.json({ success: true, url: blob.url })
  } catch (error) {
    console.error('Label storage error:', error)
    return NextResponse.json({ success: true, warning: 'Label could not be stored.' })
  }
}
