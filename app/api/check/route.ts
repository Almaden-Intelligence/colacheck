import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { WINE_SYSTEM_PROMPT } from '@/lib/wine-prompt'
import { SPIRITS_SYSTEM_PROMPT } from '@/lib/spirits-prompt'
import { BEER_SYSTEM_PROMPT } from '@/lib/beer-prompt'
import type { CheckRequest, ComplianceReport } from '@/lib/types'
import { measureLabel } from '@/lib/measure'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PROMPTS = { wine: WINE_SYSTEM_PROMPT, spirits: SPIRITS_SYSTEM_PROMPT, beer: BEER_SYSTEM_PROMPT }
const CFR_PARTS = { wine: '27 CFR Part 4', spirits: '27 CFR Part 5', beer: '27 CFR Part 7' }

export async function POST(request: NextRequest) {
  try {
    const body: CheckRequest = await request.json()
        const { category, imageBase64, imageMimeType, backImageBase64, backImageMimeType, labelWidthMm, labelHeightMm } = body

    if (!imageBase64 || !imageMimeType)
      return NextResponse.json({ success: false, error: 'Front label image is required.' }, { status: 400 })

    if (!['wine','spirits','beer'].includes(category))
      return NextResponse.json({ success: false, error: 'Invalid category.' }, { status: 400 })

    const systemPrompt = PROMPTS[category]
    const cfrPart = CFR_PARTS[category]

    const imageContent: Anthropic.ImageBlockParam[] = [{
      type: 'image',
      source: { type: 'base64', media_type: imageMimeType as 'image/jpeg'|'image/png'|'image/gif'|'image/webp', data: imageBase64 },
    }]

    if (backImageBase64 && backImageMimeType) {
      imageContent.push({
        type: 'image',
        source: { type: 'base64', media_type: backImageMimeType as 'image/jpeg'|'image/png'|'image/gif'|'image/webp', data: backImageBase64 },
      })
    }

    const labelNote = backImageBase64
      ? 'The first image is the FRONT label and the second image is the BACK label. Analyze both together for a complete compliance check.'
      : 'Only the front label has been provided. Note any checks that require the back label as "review" status.'

    const categoryLabel = category === 'beer' ? 'malt beverage' : category

    const measurement = await measureLabel(imageBase64, labelWidthMm, labelHeightMm)

    const response = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 8192,
      temperature: 0,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: [
          ...imageContent,
          ...(measurement ? [{ type: 'text' as const, text: measurement }] : []),
          { type: 'text', text: `${labelNote}\n\nPlease analyze this ${categoryLabel} label for TTB compliance. Check all mandatory requirements under ${cfrPart} and return your findings as JSON.` }, 
        ],
      }],
    })

    const textContent = response.content.find(b => b.type === 'text')
    if (!textContent || textContent.type !== 'text') throw new Error('No text response from AI')

    let raw = textContent.text.trim()
    raw = raw.replace(/^```json\s*/i,'').replace(/```\s*$/,'').trim()

    const parsed = JSON.parse(raw)
    const report: ComplianceReport = { ...parsed, category, lang: 'en', analyzed_at: new Date().toISOString() }

    return NextResponse.json({ success: true, report })
  } catch (error) {
    console.error('Check API error:', error)
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred.' }, { status: 500 })
  }
}
