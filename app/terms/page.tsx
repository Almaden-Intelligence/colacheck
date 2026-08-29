import type { Metadata } from 'next'
import PageShell, { H2, P, UL, Callout } from '@/components/PageShell'

export const metadata: Metadata = {
  title: 'Terms of Use — COLACheck',
  description: 'Terms governing use of COLACheck, including how uploaded label artwork is handled.',
}

export default function TermsPage() {
  return (
    <PageShell
      eyebrow="Terms of Use"
      title="Terms of use."
      intro="Plain terms covering what COLACheck is, what happens to the artwork you upload, and the limits of what we promise."
      updated="August 2026"
    >
      <H2>1. Who we are</H2>
      <P>
        COLACheck is operated by Almaden Studio (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By using this site you agree to
        these terms. If you do not agree, do not use the service.
      </P>

      <H2>2. What the service is</H2>
      <P>
        COLACheck is a pre-screening tool. It examines beverage alcohol label artwork against federal labeling
        requirements in 27 CFR Parts 4, 5, 7 and 16, and returns a report. It does not submit anything to the Alcohol
        and Tobacco Tax and Trade Bureau, has no affiliation with TTB, and is not connected to COLAs Online.
      </P>

      <Callout tone="review">
        <strong className="font-semibold text-ink">COLACheck is not legal advice</strong> and does not create an
        attorney-client relationship. A clean report is not an approval and does not predict how TTB will treat your
        submission. Please read the{' '}
        <a href="/limitations" className="font-medium text-brand underline underline-offset-2">limitations</a> before
        relying on any result.
      </Callout>

      <H2>3. The artwork you upload</H2>
      <P>
        <strong className="font-medium text-ink">You keep ownership of everything you upload.</strong> We claim no
        rights in your label designs, brands, or artwork.
      </P>
      <P>By uploading, you grant us a limited, non-exclusive licence to:</P>
      <UL items={[
        'Process your images in order to produce your report. This involves sending them to Anthropic, our AI provider, which performs the analysis.',
        'Retain your images and the resulting report so we can review the tool\u2019s accuracy and improve it.',
        'Analyse aggregate patterns across many checks — for example how often a given requirement is missed.',
      ]} />
      <P>
        <strong className="font-medium text-ink">We will not</strong> publish your artwork, sell or licence it to
        anyone, use it in marketing, portfolio work, or case studies, or show it as an example — whether or not it is
        identifiable. Retained material is used to check and improve COLACheck and for nothing else.
      </P>

      <H2>4. You must have the right to upload it</H2>
      <P>
        You confirm that you own the artwork you upload, or have permission from whoever does. Do not upload material
        you are not entitled to share. Do not upload personal data, confidential information unrelated to the label,
        or anything unlawful.
      </P>

      <H2>5. Your email address</H2>
      <P>
        If you give us an email address, we use it to send you your report and to contact you about that check. We do
        not sell or rent it. If we ever want to send you anything else, we will ask first.
      </P>

      <H2>6. Deletion</H2>
      <P>
        You can ask us to delete your uploaded artwork, your report, and your email address at any time by writing to{' '}
        <a href="mailto:info@almadengroup.com" className="text-brand underline underline-offset-2">info@almadengroup.com</a>.
        We will do so promptly. Aggregate statistics that do not identify you or your product may remain.
      </P>

      <H2>7. Beta, and no warranty</H2>
      <P>
        COLACheck is in beta and provided free of charge, <strong className="font-medium text-ink">as is</strong> and{' '}
        <strong className="font-medium text-ink">as available</strong>, with no warranty of any kind — express or
        implied — including as to accuracy, completeness, fitness for a particular purpose, or availability. Findings
        may be incomplete or wrong. Verify anything you intend to act on.
      </P>

      <H2>8. Limitation of liability</H2>
      <P>
        To the fullest extent permitted by law, we are not liable for any loss arising from your use of COLACheck —
        including rejected applications, delays, re-printing costs, lost sales, or any indirect or consequential loss.
        You remain responsible for the accuracy of your own label and your own submission to TTB.
      </P>

      <H2>9. Acceptable use</H2>
      <UL items={[
        'Do not attempt to disrupt, overload, or reverse-engineer the service.',
        'Do not use automated means to submit checks at scale without asking us first.',
        'Do not present COLACheck results as an official determination, or imply endorsement by TTB or by us.',
      ]} />

      <H2>10. Changes</H2>
      <P>
        We may change these terms as the service develops. The date at the top of this page shows when it was last
        updated. Material changes affecting how we handle uploaded artwork will be reflected here before they take
        effect.
      </P>

      <H2>11. Governing law</H2>
      <P>
        These terms are governed by the laws of the State of California, and any dispute will be handled in the courts
        of Santa Clara County, California.
      </P>

      <H2>12. Contact</H2>
      <P>
        Questions about these terms, or about anything COLACheck did with your label:{' '}
        <a href="mailto:info@almadengroup.com" className="text-brand underline underline-offset-2">info@almadengroup.com</a>.
      </P>
    </PageShell>
  )
}
