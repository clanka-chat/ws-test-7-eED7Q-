import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-h1 font-bold text-text-heading">Privacy Policy</h1>
        <p className="mt-2 text-small text-text-muted">
          Last updated: March 7, 2026
        </p>

        <div className="mt-8 space-y-6 text-body leading-relaxed text-text-secondary">
          <p>
            This policy describes how clanka.chat collects, uses, and protects
            your data.
          </p>

          <h2 className="text-h3 font-semibold text-text-heading">
            1. Data We Collect
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>GitHub profile information (username, avatar, email)</li>
            <li>Profile data you provide (display name, bio, skills)</li>
            <li>Project and collaboration data</li>
            <li>Payment information via Stripe (we do not store card details)</li>
            <li>Usage data and analytics</li>
          </ul>

          <h2 className="text-h3 font-semibold text-text-heading">
            2. How We Use Your Data
          </h2>
          <p>
            We use your data to operate the platform, process payments, improve
            our service, and communicate with you about your account and
            projects.
          </p>

          <h2 className="text-h3 font-semibold text-text-heading">
            3. Data Sharing
          </h2>
          <p>
            We share data with Stripe for payment processing and GitHub for
            repository management. We do not sell your personal data to third
            parties.
          </p>

          <h2 className="text-h3 font-semibold text-text-heading">
            4. Your Controls
          </h2>
          <p>
            You can control the visibility of your revenue, projects, and
            activity through your privacy settings. You can request deletion
            of your account and data at any time.
          </p>

          <h2 className="text-h3 font-semibold text-text-heading">
            5. Contact
          </h2>
          <p>
            For privacy questions, contact us at privacy@clanka.chat.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
