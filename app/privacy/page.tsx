import type { Metadata } from 'next'
import PageShell, { H2, P, UL, Callout } from '@/components/PageShell'

export const metadata: Metadata = {
  title: 'Privacy — COLACheck',
  description: 'What COLACheck collects, who processes it, how long it is kept, and how to have it deleted.',
}

export default function PrivacyPage() {
  return (
    <PageShell
      eyebrow="Privacy"
      title="What we collect, and what we do with it."
      intro="Short, because we collect very little. No advertising, no tracking across sites, no selling anything to anyone."
      updated="September 2026"
    >
      <Callout>
        <strong className="font-semibold text-ink">The short version.</strong> You can run a check without telling us
        anything about yourself. If you want the report by email, we ask for your address. We keep your label artwork
        and report so we can check the tool&rsquo;s accuracy. We do not publish, sell, or share any of it, and you can
        ask us to delete all of it at any time.
      </Callout>

      <H2>Who we are</H2>
      <P>
        COLACheck is operated by Almaden Studio. Questions about anything on this page go to{' '}
        <a href="mailto:studio@almadengroup.com" className="text-brand underline underline-offset-2">studio@almadengroup.com</a>.
      </P>

      <H2>What you give us</H2>
      <UL items={[
        <><strong className="font-medium text-ink">Label artwork.</strong> The images you upload, plus the product class you select.</>,
        <><strong className="font-medium text-ink">Email address,</strong> if you want your report sent to you.</>,
        <><strong className="font-medium text-ink">Company name and role,</strong> both optional. The role question — importer, producer, designer, consultant — helps us understand who is using the tool. Skipping it changes nothing.</>,
      ]} />

      <H2>What we collect automatically</H2>
      <P>
        Aggregate page views, through Vercel Web Analytics. It uses no cookies, does not follow you across other
        websites, and does not build a profile of you. We see that a page was viewed, not who viewed it. This is why
        the site has no cookie banner — there is nothing to consent to.
      </P>
      <P>
        Our host also keeps standard server logs, which include IP addresses, for security and to keep the service
        running. That is ordinary infrastructure logging, not analytics, and we do not use it to identify anyone.
      </P>

        <H2>Who else touches your data</H2>
      <P>Four companies, each doing one job:</P>
      <UL items={[
        <><strong className="font-medium text-ink">Anthropic</strong> — the AI provider. Your label images are sent to Anthropic to produce your report. This is the core of how the tool works, and it cannot run without it.</>,
        <><strong className="font-medium text-ink">Google Cloud Vision</strong> — used to measure text size on your label before Anthropic reviews it. Your label images pass through this service as part of that measurement step.</>,
        <><strong className="font-medium text-ink">Vercel</strong> — hosting and analytics.</>,
        <><strong className="font-medium text-ink">Zoho</strong> — the email service that delivers your report.</>,
      ]} />
      <P>
        Nobody else. We do not use advertising networks, marketing platforms, session recording, or third-party
        trackers of any kind.
      </P>

      <H2>Why we keep your label</H2>
      <P>
        COLACheck is new, and the honest way to improve it is to compare what it said about a real label against what
        the regulation actually requires. So we keep your artwork and its report and review them for accuracy.
      </P>
      <P>
        <strong className="font-medium text-ink">We do not publish your artwork, sell it, license it, use it in
        marketing or case studies, or show it as an example.</strong> Your unreleased label designs are yours.
      </P>

      <H2>What we do with your email address</H2>
      <P>
        We send you your report. We may contact you about that specific check. We do not add you to a mailing list,
        and we do not sell or rent your address. If we ever want to send you anything else, we will ask first.
      </P>

      <H2>How long we keep things</H2>
      <P>
        Label artwork, reports, and email addresses are kept while COLACheck is in beta and we are still checking
        accuracy. When that ends, material we no longer need is deleted. Aggregate counts that identify nobody — how
        many checks ran, how often a requirement was missed — may be kept indefinitely.
      </P>

      <H2>Deleting your data</H2>
      <P>
        Email{' '}
        <a href="mailto:studio@almadengroup.com" className="text-brand underline underline-offset-2">studio@almadengroup.com</a>{' '}
        and we will delete your artwork, your report, and your email address. You do not need to give a reason. We will
        confirm when it is done.
      </P>

      <H2>Children</H2>
      <P>
        COLACheck is a professional tool for the beverage alcohol trade. It is not directed at children, and we do not
        knowingly collect information from them.
      </P>

      <H2>Changes</H2>
      <P>
        If we change how we handle your data, this page is updated before the change takes effect, and the date at the
        top will tell you when. We will not quietly start doing something with your label that this page does not
        describe.
      </P>
    </PageShell>
  )
}
