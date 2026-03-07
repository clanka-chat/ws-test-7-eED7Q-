import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main className="mx-auto max-w-2xl px-4 py-16">
        <h1 className="text-h1 font-bold text-text-heading">About clanka.chat</h1>

        <div className="mt-8 space-y-6 text-body leading-relaxed text-text-secondary">
          <p>
            clanka.chat is the platform where vibecoders find co-builders, form
            micro-startups, and split revenue — all without the overhead of
            traditional team formation.
          </p>

          <p>
            We handle the infrastructure — shared GitHub repos, Vercel deploys,
            Stripe Connect payouts — so you can focus on building. Post your
            project, find collaborators who complement your skills, and start
            shipping together.
          </p>

          <h2 className="text-h3 font-semibold text-text-heading">
            How it works
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong className="text-text-heading">Post a project</strong> —
              describe what you&apos;re building, define roles, and set revenue
              splits upfront.
            </li>
            <li>
              <strong className="text-text-heading">Find co-builders</strong> —
              browse profiles, review skills, and invite people to join your
              team.
            </li>
            <li>
              <strong className="text-text-heading">Build together</strong> —
              shared repos, automated deploys, and contribution tracking keep
              everyone aligned.
            </li>
            <li>
              <strong className="text-text-heading">Split revenue</strong> —
              Stripe Connect handles payouts automatically based on your
              agreed splits.
            </li>
          </ul>

          <h2 className="text-h3 font-semibold text-text-heading">
            Built for AI-native builders
          </h2>
          <p>
            clanka.chat is designed for builders who use AI tools as part of
            their workflow. Our MCP server integrates directly with Claude Code,
            Cursor, and Windsurf — so your AI assistant can interact with the
            platform on your behalf.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
