import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import {
  Rocket,
  Users,
  FileText,
  CreditCard,
  GitBranch,
  Globe,
  BarChart3,
  ChevronDown,
} from "lucide-react";

function Hero() {
  return (
    <section className="flex flex-col items-center px-4 pt-24 pb-20 text-center sm:pt-32 sm:pb-28">
      <h1 className="max-w-3xl text-hero font-[800] leading-[1.1] text-text-heading">
        You built 80% of the app.{" "}
        <span className="text-accent">Find someone to finish it with.</span>
      </h1>
      <p className="mt-6 max-w-xl text-body leading-relaxed text-text-secondary">
        clanka.chat helps vibecoders find co-builders, form micro-startups, and
        split the revenue. Free to use — we only take 5% when you earn.
      </p>
      <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          href="/new"
          className="inline-flex h-12 items-center rounded-md bg-accent px-8 text-body font-medium text-bg-base transition-colors duration-150 hover:bg-accent-hover"
        >
          Post Your Project
        </Link>
        <Link
          href="/explore"
          className="inline-flex h-12 items-center rounded-md border border-border-default px-8 text-body text-text-secondary transition-colors duration-150 hover:bg-accent-muted hover:text-accent"
        >
          Browse Projects
        </Link>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: FileText,
      title: "Post a listing",
      desc: "Describe what you're building and what help you need.",
    },
    {
      icon: Users,
      title: "Find a co-builder",
      desc: "Browse listings or get found by someone who fills the gap.",
    },
    {
      icon: CreditCard,
      title: "Agree on terms",
      desc: "Set revenue splits, roles, and commitment upfront.",
    },
    {
      icon: Rocket,
      title: "Ship & earn",
      desc: "Platform handles repos, deploys, and payments.",
    },
  ];

  return (
    <section className="border-t border-border-subtle px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-h2 font-bold text-text-heading">
          How it works
        </h2>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div key={step.title} className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-muted">
                <step.icon size={24} className="text-accent" />
              </div>
              <span className="mt-2 font-mono text-caption text-text-muted">
                0{i + 1}
              </span>
              <h3 className="mt-2 text-h3 font-semibold text-text-heading">
                {step.title}
              </h3>
              <p className="mt-2 text-small text-text-secondary">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function PlatformHandles() {
  const features = [
    {
      icon: GitBranch,
      title: "Repos",
      desc: "Platform-controlled GitHub repos with managed access.",
    },
    {
      icon: Globe,
      title: "Deploys",
      desc: "One-click deploys via Vercel. See your project live in seconds.",
    },
    {
      icon: CreditCard,
      title: "Revenue splitting",
      desc: "Stripe Connect payouts every 48 hours. Automatic, transparent.",
    },
    {
      icon: BarChart3,
      title: "Contribution tracking",
      desc: "Automatic tracking across all roles — not just code.",
    },
  ];

  return (
    <section className="border-t border-border-subtle px-4 py-20">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center text-h2 font-bold text-text-heading">
          You build. We handle the infrastructure.
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-lg border border-border-default bg-bg-surface p-6"
            >
              <f.icon size={20} className="text-accent" />
              <h3 className="mt-3 text-h3 font-semibold text-text-heading">
                {f.title}
              </h3>
              <p className="mt-2 text-small text-text-secondary">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TheProblem() {
  return (
    <section className="border-t border-border-subtle px-4 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-h2 font-bold text-text-heading">The last 20%</h2>
        <p className="mt-4 text-body text-text-secondary">
          You built most of the app but can&apos;t finish deployment, auth, or
          payments alone. Building alone is slow and lonely. No tools exist for
          &quot;I&apos;m stuck, help me finish this.&quot;
        </p>
        <p className="mt-4 text-body text-text-secondary">
          Fiverr and Upwork are transactional — you hire someone, they leave.
          clanka is collaborative — you find someone, you build together, you
          split the money.
        </p>
      </div>
    </section>
  );
}

function WhoItsFor() {
  return (
    <section className="border-t border-border-subtle px-4 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-h2 font-bold text-text-heading">
          Built for vibecoders
        </h2>
        <p className="mt-4 text-body text-text-secondary">
          A vibecoder is anyone who uses AI to build things. Not just coders —
          marketers, designers, PMs, anyone who ships with AI tools.
        </p>
        <p className="mt-4 text-body text-text-secondary">
          You don&apos;t need to be an expert. If you use AI to make things, you
          belong here.
        </p>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="border-t border-border-subtle px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-h2 font-bold text-text-heading">
          Free to use. 5% on revenue that flows through.
        </h2>
        <p className="mt-4 text-body text-text-secondary">
          That 5% covers repos, deploys, revenue processing, and contribution
          tracking. No tiers, no upsells. One model.
        </p>
        <div className="mx-auto mt-8 max-w-sm rounded-lg border border-border-default bg-bg-surface p-6">
          <div className="text-hero font-[800] text-accent">5%</div>
          <p className="mt-2 text-small text-text-muted">
            Only on revenue that flows through the platform.
          </p>
        </div>
      </div>
    </section>
  );
}

function FAQ() {
  const faqs = [
    {
      q: "What is a vibecoder?",
      a: "Anyone who uses AI to build things — Cursor, Bolt, Claude, ChatGPT, whatever your tool is. Not just coders. Marketers, designers, and PMs who ship with AI count too.",
    },
    {
      q: "Do I need to know how to code?",
      a: "No. clanka is for all roles. If you're a marketer who can grow a product or a designer who can nail the UX, there's a spot for you.",
    },
    {
      q: "How does revenue splitting work?",
      a: "When you agree to collaborate, you set revenue splits upfront. Stripe Connect handles automatic payouts every 48 hours based on those splits.",
    },
    {
      q: "What happens if someone leaves a project?",
      a: "Their split stays as agreed until the remaining team changes terms. The platform tracks all contributions so there's a clear record.",
    },
    {
      q: "Is it really free?",
      a: "Yes. You only pay 5% on revenue that flows through the platform. No subscription, no setup fee, no hidden costs.",
    },
    {
      q: "How do I get started?",
      a: 'Sign up with GitHub, post a listing describing what you\'re building, and what help you need. It takes about 2 minutes.',
    },
    {
      q: "What if I just have an idea but haven't built anything?",
      a: 'That\'s fine. Post it as an "idea" stage listing. Some of the best collaborations start with just a concept and the right co-builder.',
    },
  ];

  return (
    <section className="border-t border-border-subtle px-4 py-20">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-h2 font-bold text-text-heading">FAQ</h2>
        <div className="mt-10 space-y-0 divide-y divide-border-subtle">
          {faqs.map((faq) => (
            <details key={faq.q} className="group py-5">
              <summary className="flex cursor-pointer items-center justify-between text-body font-medium text-text-heading">
                {faq.q}
                <ChevronDown
                  size={18}
                  className="text-text-muted transition-transform duration-150 group-open:rotate-180"
                />
              </summary>
              <p className="mt-3 text-small leading-relaxed text-text-secondary">
                {faq.a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function FooterCTA() {
  return (
    <section className="border-t border-border-subtle px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-h2 font-bold text-text-heading">
          Stop building alone.
        </h2>
        <p className="mt-4 text-body text-text-secondary">
          Find a co-builder, ship a product, split the revenue.
        </p>
        <div className="mt-8">
          <Link
            href="/new"
            className="inline-flex h-12 items-center rounded-md bg-accent px-8 text-body font-medium text-bg-base transition-colors duration-150 hover:bg-accent-hover"
          >
            Post Your Project
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <PlatformHandles />
        <TheProblem />
        <WhoItsFor />
        <Pricing />
        <FAQ />
        <FooterCTA />
      </main>
      <Footer />
    </>
  );
}
