interface Vertex { x?: number; y?: number }

interface LineAcc {
  text: string
  heights: number[]
  minX: number
  maxX: number
}

const VISION_URL = 'https://vision.googleapis.com/v1/images:annotate'
const MAX_LINES = 60
const ASPECT_TOLERANCE = 0.10

function median(ns: number[]): number {
  const s = [...ns].sort((a, b) => a - b)
  const m = Math.floor(s.length / 2)
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2
}

/**
 * Measures the height of text on a label image using Google Cloud Vision OCR.
 * Returns a plain-text measurement table, or null if measurement is unavailable
 * for any reason. Never throws.
 */
export async function measureLabel(
  imageBase64: string,
  labelWidthMm?: number,
  labelHeightMm?: number,
): Promise<string | null> {
  const key = process.env.GOOGLE_VISION_API_KEY
  if (!key) return null
  if (!labelWidthMm || !Number.isFinite(labelWidthMm) || labelWidthMm <= 0) return null

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 15000)

    const res = await fetch(`${VISION_URL}?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        requests: [{
          image: { content: imageBase64 },
          features: [{ type: 'DOCUMENT_TEXT_DETECTION' }],
        }],
      }),
    }).finally(() => clearTimeout(timeout))

    if (!res.ok) {
      console.error('Vision API returned', res.status)
      return null
    }

    const data = await res.json()
    if (data?.responses?.[0]?.error) {
      console.error('Vision API error:', data.responses[0].error.message)
      return null
    }

    const page = data?.responses?.[0]?.fullTextAnnotation?.pages?.[0]
    const imgW = page?.width
    const imgH = page?.height
    if (!page || !imgW || imgW <= 0) return null

    const mmPerPx = labelWidthMm / imgW

    // Walk to character level, keeping only capitals and digits for height,
    // since those approximate true letter height. Lowercase bounding boxes
    // include ascenders and descenders and overstate it.
    const lines: LineAcc[] = []
    let cur: LineAcc = { text: '', heights: [], minX: Infinity, maxX: -Infinity }

    const flush = () => {
      if (cur.text.trim().length >= 2 && cur.heights.length > 0) lines.push(cur)
      cur = { text: '', heights: [], minX: Infinity, maxX: -Infinity }
    }

    for (const block of page.blocks ?? []) {
      for (const para of block.paragraphs ?? []) {
        for (const word of para.words ?? []) {
          for (const sym of word.symbols ?? []) {
            const t: string = sym.text ?? ''
            cur.text += t

            const vs: Vertex[] = sym.boundingBox?.vertices ?? []
            if (vs.length) {
              const xs = vs.map(v => v.x ?? 0)
              const ys = vs.map(v => v.y ?? 0)
              cur.minX = Math.min(cur.minX, Math.min(...xs))
              cur.maxX = Math.max(cur.maxX, Math.max(...xs))
              if (/[A-Z0-9]/.test(t)) cur.heights.push(Math.max(...ys) - Math.min(...ys))
            }

            const brk = sym.property?.detectedBreak?.type
            if (brk === 'SPACE') cur.text += ' '
            if (brk === 'LINE_BREAK' || brk === 'EOL_SURE_SPACE') flush()
          }
        }
      }
    }
    flush()

    if (lines.length === 0) return null

    const rows = lines.slice(0, MAX_LINES).map(l => {
      const heightMm = median(l.heights) * mmPerPx
      const widthPx = l.maxX - l.minX
      const widthMm = widthPx > 0 ? widthPx * mmPerPx : 0
      const inches = widthMm / 25.4
      const chars = l.text.trim().length
      const cpi = inches > 0 ? chars / inches : 0
      return {
        text: l.text.trim().replace(/\s+/g, ' '),
        heightMm: heightMm.toFixed(1),
        cpi: cpi > 0 ? cpi.toFixed(0) : '-',
      }
    })

    const out: string[] = []
    out.push('MEASURED TYPE SIZE — front label only')
    out.push('Source: Google Cloud Vision OCR character bounding boxes.')
    out.push(`Scale: stated label width ${labelWidthMm} mm / image width ${imgW} px = ${mmPerPx.toFixed(4)} mm per pixel.`)

    if (labelHeightMm && Number.isFinite(labelHeightMm) && labelHeightMm > 0 && imgH > 0) {
      const stated = labelWidthMm / labelHeightMm
      const actual = imgW / imgH
      const dev = Math.abs(actual - stated) / stated
      if (dev > ASPECT_TOLERANCE) {
        out.push(
          `WARNING: the stated label proportions (${labelWidthMm} x ${labelHeightMm} mm) do not match the image proportions ` +
          `(${imgW} x ${imgH} px), a difference of ${(dev * 100).toFixed(0)}%. The image is probably not cropped to the label edge, ` +
          `or the dimensions were entered incorrectly. Every measurement below is unreliable and most likely reads too large. ` +
          `Say so explicitly in the Type Size finding.`,
        )
      } else {
        out.push(`Proportion check: stated and image proportions agree within ${(dev * 100).toFixed(0)}%.`)
      }
    }

    out.push('')
    out.push('height_mm | chars_per_inch | text')
    for (const r of rows) out.push(`${r.heightMm} | ${r.cpi} | ${r.text}`)
    if (lines.length > MAX_LINES) out.push(`(${lines.length - MAX_LINES} further lines not listed)`)

    out.push('')
    out.push(
      'Match these measured lines to the mandatory label elements you identify by comparing the text. ' +
      'Character bounding boxes slightly overstate true letter height, and any uncropped margin inflates the scale, ' +
      'so both known errors run toward reporting text as larger than it is. Treat a measurement at or just above a ' +
      'minimum as unconfirmed, never as a pass.',
    )

    return out.join('\n')
  } catch (err) {
    console.error('Label measurement failed:', err)
    return null
  }
}
