import type { Metadata } from 'next'
import PageShell, { H2, P, UL, Callout } from '@/components/PageShell'

export const metadata: Metadata = {
  title: 'Limitations — COLACheck',
  description: 'What COLACheck can and cannot determine from a label image, and why.',
}

export default function LimitationsPage() {
  return (
    <PageShell
      eyebrow="Limitations"
      title="What COLACheck cannot do."
      intro="Read this before you rely on a result. Every limitation below is real, and naming them precisely is the only way a result here is worth anything."
      updated="August 2026"
    >
      <Callout tone="review">
        <strong className="font-semibold text-ink">A pass is not an approval, and not a prediction of one.</strong>{' '}
        COLACheck checks whether required elements are present and correctly stated on your artwork. TTB reviewers
        apply judgment, internal policy, and precedent that no published regulation fully captures. A label can clear
        every check here and still be rejected. Nothing on this site forecasts what TTB will do with your submission.
      </Callout>

      <H2>It only sees the image</H2>
      <P>Several requirements are physical. An image cannot settle them:</P>
      <UL items={[
                <><strong className="font-medium text-ink">Type size.</strong> Mandatory text must meet minimum heights in millimetres. If you supply the physical dimensions of the label we can estimate those heights from your artwork, but an estimate taken from an image is not a measurement of the printed container.</>,
        <><strong className="font-medium text-ink">Legibility and contrast</strong> under ordinary viewing conditions.</>,
        <><strong className="font-medium text-ink">Whether the label is firmly affixed,</strong> and whether it can be removed by soaking — a requirement under Part 7.</>,
        <><strong className="font-medium text-ink">Actual container volume,</strong> as opposed to what the label claims.</>,
      ]} />
      <P>
        On type size specifically: where you give us the label&rsquo;s width and height, we read the text on your
        artwork and report its height in millimetres against the threshold that applies. Two things stop that from
        being conclusive. The character outlines we measure are slightly taller than the letters inside them, and any
        margin left around the label in your image stretches the scale — both errors make text read larger than it
        really is. A measured height is therefore always returned as{' '}
        <strong className="font-medium text-ink">Review</strong>, never as Pass, and the figure is only as accurate as
        the dimensions you enter. Estimated dimensions produce estimated millimetres.
      </P>
    
      <H2>It cannot verify facts that aren&rsquo;t printed on the label</H2>
      <P>
        Some of the most consequential requirements turn on facts about the liquid, not the artwork. These are always
        returned as <strong className="font-medium text-ink">Review</strong>, never as Pass:
      </P>
      <UL items={[
        'Sulfur dioxide at or above 10 ppm, which is what triggers the sulfite declaration.',
        'Grape percentages behind an appellation of origin — 75% for a country, state or county; 85% for a viticultural area; and for multicounty or multistate appellations, all of the fruit from the named areas with each percentage stated on the label.',
        'Vintage percentages — 95% for a viticultural area appellation, 85% otherwise.',
        'Whether "Estate Bottled" conditions are actually met.',
        'Whether a stated age, alcohol content, or class designation is truthful.',
        'Whether colorings or additives requiring disclosure were in fact used.',
      ]} />
      <P>A Review is not a soft pass. It means we cannot answer, and you must.</P>

      <H2>It checks federal requirements only</H2>
      <P>
        Nothing here covers state labeling law, state registration or franchise requirements, container-deposit
        marking, or local rules. Several states impose requirements beyond the federal ones.{' '}
        <strong className="font-medium text-ink">A federally compliant label may still be non-compliant in the state
        where you intend to sell it.</strong>
      </P>

      <H2>It does not cover everything TTB looks at</H2>
      <P>
        Out of scope: formula and lab sample approval, FDA requirements, trademark conflicts, distinctive liquor
        bottle approval, and the accuracy of your COLA application form itself.
      </P>

      <H2>The checks are derived from the regulation, not a substitute for it</H2>
      <P>
        The requirement list is written and maintained by hand from 27 CFR. It reflects human judgment about what
        matters and how to state it, and it can be incomplete or wrong in ways an automated system would not detect.
        The regulation itself always governs.
      </P>

      <H2>It is AI-based, and AI misreads things</H2>
      <P>
        Analysis is performed by a machine learning model. It can misread stylized typefaces, foil, embossing, curved
        or angled photographs, low-resolution scans, and text in languages other than English. It can also be
        confidently wrong. Upload the highest-resolution artwork you have, and treat every finding as something to
        verify rather than something to act on unread.
      </P>

      <H2>It is in beta and has had limited real-world testing</H2>
      <P>
        COLACheck is new. It has not been validated against a large corpus of previously approved and rejected labels.
        Findings may be incomplete or incorrect. It is free during this period, and the absence of a fee reflects the
        absence of a warranty.
      </P>

      <H2>This is not legal advice</H2>
      <P>
        COLACheck provides informational guidance based on published TTB regulations. It does not create an
        attorney-client relationship and is not a substitute for professional advice. For complex submissions, unusual
        label designs, or anything with money riding on it, consult a qualified attorney or contact TTB directly at{' '}
        <strong className="font-medium text-ink">1-866-927-2533</strong> or{' '}
        <a href="mailto:alfd@ttb.gov" className="text-brand underline underline-offset-2">alfd@ttb.gov</a>.
      </P>

      <Callout>
        Found something COLACheck got wrong? That is the most useful thing you can send us during beta —{' '}
        <a href="mailto:studio@almadengroup.com" className="font-medium text-brand underline underline-offset-2">
          studio@almadengroup.com
        </a>.
      </Callout>
    </PageShell>
  )
}
