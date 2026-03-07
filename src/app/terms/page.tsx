import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function TermsPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-h1 font-bold text-text-heading">Terms of Service</h1>
        <p className="mt-2 text-small text-text-muted">
          Last updated: March 7, 2026
        </p>

        <div className="mt-8 space-y-6 text-body leading-relaxed text-text-secondary">
          <p>
            These terms govern your use of clanka.chat. By creating an account
            or using the platform, you agree to these terms.
          </p>

          <h2 className="text-h3 font-semibold text-text-heading">
            1. Accounts
          </h2>
          <p>
            You must sign in with a valid GitHub account. You are responsible
            for all activity under your account. You must be at least 18 years
            old to use the platform.
          </p>

          <h2 className="text-h3 font-semibold text-text-heading">
            2. Projects & Collaboration
          </h2>
          <p>
            When you create or join a project, you agree to the revenue split
            defined in the project roles. Revenue splits are set by the project
            creator and accepted by collaborators upon joining.
          </p>

          <h2 className="text-h3 font-semibold text-text-heading">
            3. Payments
          </h2>
          <p>
            clanka.chat charges a 5% platform fee on all revenue processed
            through the platform. Payouts are handled via Stripe Connect and
            are subject to Stripe&apos;s terms of service.
          </p>

          <h2 className="text-h3 font-semibold text-text-heading">
            4. Content & Conduct
          </h2>
          <p>
            You retain ownership of all code and content you create. You must
            not use the platform for illegal activity, spam, or harassment. We
            reserve the right to remove content or suspend accounts that
            violate these terms.
          </p>

          <h2 className="text-h3 font-semibold text-text-heading">
            5. Limitation of Liability
          </h2>
          <p>
            clanka.chat is provided &ldquo;as is&rdquo; without warranties. We
            are not liable for disputes between collaborators, lost revenue, or
            service interruptions.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
