import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { PageHeading } from "@/components/design-system/page-heading";
import { APP_NAME } from "@/constants/site";

export const metadata = {
  title: "Terms & Conditions",
  description: `The terms that govern your use of ${APP_NAME}.`,
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

export default function TermsPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <SiteHeader />
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-6 py-12">
        <PageHeading
          eyebrow="Legal"
          title="Terms & Conditions"
          description={`Last updated ${EFFECTIVE_DATE}`}
        />

        <div className="flex flex-col gap-10">
          <p className="text-muted-foreground leading-relaxed">
            These Terms govern your use of {APP_NAME}. By creating an account or using the app,
            you agree to them. Please read them carefully before joining or hosting a ride.
          </p>

          <Section title="1. Who Can Use RoadKin">
            <p>
              You must be at least 18 years old and hold a valid license for the vehicle you ride
              to use {APP_NAME}. You're responsible for complying with all local traffic, licensing,
              and safety laws when riding — on or off a ride organized through the app.
            </p>
          </Section>

          <Section title="2. Account Types">
            <p>
              {APP_NAME} has two account types. A <strong className="text-foreground">Rider</strong>{" "}
              account can create free Community Rides and join or book any ride. An{" "}
              <strong className="text-foreground">Organizer</strong> account (a "Ride Captain" on
              paid rides) can host Organized Rides for a fee, collected through Razorpay. Your
              account type is chosen at signup and isn't reversible from within the app.
            </p>
          </Section>

          <Section title="3. Community Rides & Organized Rides">
            <p>
              <strong className="text-foreground">Community Rides</strong> are free, peer-run rides
              that any rider can create and join, subject to the organizer's approval of join
              requests.
            </p>
            <p>
              <strong className="text-foreground">Organized Rides</strong> are paid, hosted rides
              run by an Organizer. Booking an Organized Ride requires payment through Razorpay at
              the ride fee set by its Ride Captain. {APP_NAME} deducts a platform fee from each
              booking before settling the remainder to the Ride Captain.
            </p>
          </Section>

          <Section title="4. Payments, Cancellations & Refunds">
            <p>
              All payments for Organized Rides are processed by Razorpay. {APP_NAME} does not store
              your payment card or bank details. Cancellation and refund terms for a specific ride
              are set by its Ride Captain and shown on the ride's page before you book — review them
              before paying. Disputes over a specific charge should first be raised with the Ride
              Captain; unresolved payment disputes can be escalated to Razorpay or to us at the
              contact below.
            </p>
          </Section>

          <Section title="5. Assumption of Risk">
            <p>
              Motorcycle riding carries inherent risks, including serious injury or death.{" "}
              {APP_NAME} is a platform that connects riders — we do not organize, supervise, lead,
              or guarantee the safety of any ride, whether Community or Organized. Every rider who
              joins a ride does so at their own risk and is responsible for their own safety gear,
              vehicle condition, and riding decisions. {APP_NAME} is not liable for any accident,
              injury, loss, or damage arising from a ride booked or joined through the app.
            </p>
          </Section>

          <Section title="6. Organizer & Ride Captain Responsibilities">
            <p>
              If you create a ride, you're responsible for the accuracy of its details (route,
              timing, difficulty, inclusions), for fairly reviewing join requests, and — for
              Organized Rides — for honoring the itinerary, inclusions, and cancellation policy you
              publish. Marking a rider's attendance after a ride should reflect what actually
              happened.
            </p>
          </Section>

          <Section title="7. User Content">
            <p>
              You retain ownership of the photos, messages, and ride details you post. By posting
              them, you grant {APP_NAME} a license to display and distribute that content within the
              app — for example, showing a ride's cover photo in search results or a gallery image
              on a rider's profile.
            </p>
          </Section>

          <Section title="8. Prohibited Conduct">
            <p>You agree not to:</p>
            <ul className="list-disc pl-5">
              <li>Post false, misleading, or fraudulent ride listings or profile information.</li>
              <li>Harass, threaten, or discriminate against another rider.</li>
              <li>Use the platform to solicit payment outside of Razorpay for an Organized Ride.</li>
              <li>Attempt to access another user's account or interfere with the platform's security.</li>
            </ul>
          </Section>

          <Section title="9. Termination">
            <p>
              We may suspend or terminate an account that violates these Terms or puts other riders
              at risk. You may stop using {APP_NAME} at any time.
            </p>
          </Section>

          <Section title="10. Disclaimers & Limitation Of Liability">
            <p>
              {APP_NAME} is provided "as is," without warranties of any kind. To the fullest extent
              permitted by law, {APP_NAME} and its team are not liable for any indirect, incidental,
              or consequential damages arising from your use of the app or participation in any
              ride.
            </p>
          </Section>

          <Section title="11. Governing Law">
            <p>These Terms are governed by the laws of India.</p>
          </Section>

          <Section title="12. Changes To These Terms">
            <p>
              We may update these Terms as {APP_NAME} evolves. Continuing to use the app after a
              change means you accept the updated Terms.
            </p>
          </Section>

          <Section title="13. Contact Us">
            <p>
              Questions about these Terms? Reach us at{" "}
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
