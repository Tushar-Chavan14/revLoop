import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PageHeading } from "@/components/design-system/page-heading";
import { APP_NAME } from "@/constants/site";

export const metadata = {
  title: "Privacy Policy",
  description: `How ${APP_NAME} collects, uses, and protects your information.`,
};

const EFFECTIVE_DATE = "August 14, 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-heading text-xl font-bold tracking-tight">{title}</h2>
      <div className="text-muted-foreground flex flex-col gap-3 leading-relaxed">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
        <PageHeading
          eyebrow="Legal"
          title="Privacy Policy"
          description={`Last updated ${EFFECTIVE_DATE}`}
        />

        <div className="flex flex-col gap-10">
          <p className="text-muted-foreground leading-relaxed">
            {APP_NAME} connects riders for breakfast runs, weekend loops, and hosted tours. This
            policy explains what information we collect when you use the app, how we use it, and
            the choices you have. By creating an account, you agree to the practices described
            here.
          </p>

          <Section title="1. Information We Collect">
            <p>
              <strong className="text-foreground">Account information.</strong> When you sign up
              with a magic link or a social provider, we receive your email address and, where
              provided, your name and profile photo.
            </p>
            <p>
              <strong className="text-foreground">Profile information.</strong> Name, username,
              city, country, bio, Instagram handle, and — for rider accounts — your bike brand,
              model, and experience level; or, for organizer accounts, your business name, primary
              destination, and contact details.
            </p>
            <p>
              <strong className="text-foreground">Ride content.</strong> Rides you create or join,
              your join requests and bookings, ride chat messages, and any photos you post to a
              ride's gallery.
            </p>
            <p>
              <strong className="text-foreground">Location data.</strong> Meeting points,
              destinations, and city searches you enter to create or find rides. We don't track
              your location in the background.
            </p>
            <p>
              <strong className="text-foreground">Payment information.</strong> For Organized
              Rides, payments are processed by Razorpay. We store the transaction, amount, and
              status of a booking — we never see or store your card, UPI, or bank details.
            </p>
            <p>
              <strong className="text-foreground">Usage data.</strong> Basic technical data (like
              device and browser type) needed to keep the app secure and working correctly.
            </p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use your information to:</p>
            <ul className="list-disc pl-5">
              <li>Create and maintain your account, and show your public rider or organizer profile.</li>
              <li>Let you create, discover, join, and book rides.</li>
              <li>Facilitate ride chat and notify you about join requests, bookings, and ride updates.</li>
              <li>Process payments and payouts for Organized Rides.</li>
              <li>Keep the platform safe — detecting abuse, fraud, and violations of our Terms.</li>
              <li>Send you transactional emails (magic links, booking confirmations, notifications).</li>
            </ul>
            <p>We don't sell your personal information, and we don't use it for third-party advertising.</p>
          </Section>

          <Section title="3. Who We Share It With">
            <p>We share information only where it's needed to run the platform:</p>
            <ul className="list-disc pl-5">
              <li>
                <strong className="text-foreground">Other riders.</strong> Your public profile,
                and — once you join a ride — your name and contact details are visible to that
                ride's organizer and fellow members.
              </li>
              <li>
                <strong className="text-foreground">Razorpay.</strong> Payment details necessary
                to process an Organized Ride booking or an organizer payout.
              </li>
              <li>
                <strong className="text-foreground">Supabase.</strong> Our database and
                authentication provider, which stores your account and ride data on our behalf.
              </li>
              <li>
                <strong className="text-foreground">Resend.</strong> Our email provider, used to
                deliver magic links and notification emails.
              </li>
            </ul>
            <p>We may also disclose information if required by law or to protect the rights and safety of our riders.</p>
          </Section>

          <Section title="4. Data Retention & Deletion">
            <p>
              We keep your information for as long as your account is active. You can request
              deletion of your account and associated data at any time by contacting us — we'll
              remove it within a reasonable time, except where we're required to retain records
              (for example, completed payment transactions) for legal or accounting purposes.
            </p>
          </Section>

          <Section title="5. Security">
            <p>
              We use industry-standard safeguards — encrypted connections, access controls, and
              row-level security on our database — to protect your information. No system is
              perfectly secure, so we can't guarantee absolute protection, but we work to keep your
              data safe.
            </p>
          </Section>

          <Section title="6. Children's Privacy">
            <p>
              {APP_NAME} is not intended for anyone under 18. We don't knowingly collect
              information from minors. If you believe a minor has created an account, contact us
              and we'll remove it.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>
              You can access, update, or correct most of your profile information directly in the
              app. You may also request a copy of your data, or ask us to delete your account, by
              reaching out through the contact details below.
            </p>
          </Section>

          <Section title="8. Changes To This Policy">
            <p>
              We may update this policy as the app evolves. If we make material changes, we'll
              update the date at the top of this page.
            </p>
          </Section>

          <Section title="9. Contact Us">
            <p>
              Questions about this policy or your data? Reach us at{" "}
              <a href="mailto:support@roadkin.in" className="text-primary underline">
                support@roadkin.in
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
