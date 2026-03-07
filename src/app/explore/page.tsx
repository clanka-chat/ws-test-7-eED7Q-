"use client";

import { useState } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ProjectCard } from "@/components/ProjectCard";
import { Search } from "lucide-react";
import type { Project, ProjectRole } from "../../../types/database";

const STAGES = ["all", "idea", "needs-help", "building", "launched"] as const;

const MOCK_PROJECTS: (Project & { roles: ProjectRole[]; creatorName: string })[] = [
  {
    id: "1",
    slug: "clanka-chat-k8m2x4",
    creator_id: "u1",
    name: "clanka.chat",
    description:
      "The platform itself. Looking for a frontend dev and a growth marketer to help ship the MVP.",
    stage: "building",
    tech_stack: ["Next.js", "Supabase", "Stripe", "Vercel"],
    business_model: "Platform fee (5%)",
    domain_plan: null,
    time_commitment: "20+ hrs/week",
    timezone: "UTC-5",
    is_public: true,
    github_repo_name: null,
    github_repo_full_name: null,
    github_repo_url: null,
    vercel_project_id: null,
    vercel_deploy_hook_url: null,
    live_url: null,
    created_at: "2026-03-01T00:00:00Z",
    updated_at: "2026-03-06T00:00:00Z",
    roles: [
      { id: "r1", project_id: "1", role_title: "Creator", role_type: "code", description: null, revenue_split: 50, filled: true, filled_by: "u1", created_at: "2026-03-01T00:00:00Z" },
      { id: "r2", project_id: "1", role_title: "Frontend", role_type: "code", description: null, revenue_split: 30, filled: false, filled_by: null, created_at: "2026-03-01T00:00:00Z" },
      { id: "r3", project_id: "1", role_title: "Growth", role_type: "marketing", description: null, revenue_split: 20, filled: false, filled_by: null, created_at: "2026-03-01T00:00:00Z" },
    ],
    creatorName: "spaghettipete",
  },
  {
    id: "2",
    slug: "vibetunes-p3r7n1",
    creator_id: "u2",
    name: "VibeTunes",
    description:
      "AI-powered playlist curator for indie artists. Connects Spotify API with taste-matching algorithms.",
    stage: "idea",
    tech_stack: ["Python", "FastAPI", "Spotify API"],
    business_model: "Freemium",
    domain_plan: null,
    time_commitment: "10-15 hrs/week",
    timezone: "UTC+1",
    is_public: true,
    github_repo_name: null,
    github_repo_full_name: null,
    github_repo_url: null,
    vercel_project_id: null,
    vercel_deploy_hook_url: null,
    live_url: null,
    created_at: "2026-03-02T00:00:00Z",
    updated_at: "2026-03-05T00:00:00Z",
    roles: [
      { id: "r4", project_id: "2", role_title: "Creator", role_type: "code", description: null, revenue_split: 60, filled: true, filled_by: "u2", created_at: "2026-03-02T00:00:00Z" },
      { id: "r5", project_id: "2", role_title: "Marketer", role_type: "marketing", description: null, revenue_split: 40, filled: false, filled_by: null, created_at: "2026-03-02T00:00:00Z" },
    ],
    creatorName: "melodymaya",
  },
  {
    id: "3",
    slug: "shipkit-w9d5j6",
    creator_id: "u3",
    name: "ShipKit",
    description:
      "Boilerplate generator for vibecoded apps. Pick your stack, get a deployable starter in 30 seconds.",
    stage: "needs-help",
    tech_stack: ["TypeScript", "CLI", "Templates"],
    business_model: "One-time purchase",
    domain_plan: null,
    time_commitment: "15-20 hrs/week",
    timezone: "UTC-8",
    is_public: true,
    github_repo_name: null,
    github_repo_full_name: null,
    github_repo_url: null,
    vercel_project_id: null,
    vercel_deploy_hook_url: null,
    live_url: null,
    created_at: "2026-03-03T00:00:00Z",
    updated_at: "2026-03-06T00:00:00Z",
    roles: [
      { id: "r6", project_id: "3", role_title: "Creator", role_type: "code", description: null, revenue_split: 55, filled: true, filled_by: "u3", created_at: "2026-03-03T00:00:00Z" },
      { id: "r7", project_id: "3", role_title: "Backend", role_type: "code", description: null, revenue_split: 45, filled: false, filled_by: null, created_at: "2026-03-03T00:00:00Z" },
    ],
    creatorName: "devdaniel",
  },
  {
    id: "4",
    slug: "pixelpay-m4k9q2",
    creator_id: "u4",
    name: "PixelPay",
    description:
      "Micropayment system for digital art. Creators get paid per view with crypto-backed microtransactions.",
    stage: "launched",
    tech_stack: ["React", "Node.js", "Stripe", "PostgreSQL"],
    business_model: "Transaction fee",
    domain_plan: null,
    time_commitment: "5-10 hrs/week",
    timezone: "UTC+0",
    is_public: true,
    github_repo_name: null,
    github_repo_full_name: null,
    github_repo_url: null,
    vercel_project_id: null,
    vercel_deploy_hook_url: null,
    live_url: "https://pixelpay.vercel.app",
    created_at: "2026-02-15T00:00:00Z",
    updated_at: "2026-03-06T00:00:00Z",
    roles: [
      { id: "r8", project_id: "4", role_title: "Creator", role_type: "code", description: null, revenue_split: 50, filled: true, filled_by: "u4", created_at: "2026-02-15T00:00:00Z" },
      { id: "r9", project_id: "4", role_title: "Designer", role_type: "design", description: null, revenue_split: 25, filled: true, filled_by: "u5", created_at: "2026-02-20T00:00:00Z" },
      { id: "r10", project_id: "4", role_title: "Marketer", role_type: "marketing", description: null, revenue_split: 25, filled: true, filled_by: "u6", created_at: "2026-02-22T00:00:00Z" },
    ],
    creatorName: "artisanalice",
  },
  {
    id: "5",
    slug: "growthbot-x7n3v8",
    creator_id: "u5",
    name: "GrowthBot",
    description:
      "Automated social media scheduling with AI captions. Post once, reach everywhere.",
    stage: "building",
    tech_stack: ["Next.js", "OpenAI", "Twitter API", "Meta API"],
    business_model: "SaaS subscription",
    domain_plan: null,
    time_commitment: "10-15 hrs/week",
    timezone: "UTC-5",
    is_public: true,
    github_repo_name: null,
    github_repo_full_name: null,
    github_repo_url: null,
    vercel_project_id: null,
    vercel_deploy_hook_url: null,
    live_url: null,
    created_at: "2026-03-04T00:00:00Z",
    updated_at: "2026-03-06T00:00:00Z",
    roles: [
      { id: "r11", project_id: "5", role_title: "Creator", role_type: "code", description: null, revenue_split: 60, filled: true, filled_by: "u5", created_at: "2026-03-04T00:00:00Z" },
      { id: "r12", project_id: "5", role_title: "Marketing", role_type: "marketing", description: null, revenue_split: 40, filled: false, filled_by: null, created_at: "2026-03-04T00:00:00Z" },
    ],
    creatorName: "growthguru",
  },
];

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  const filtered = MOCK_PROJECTS.filter((p) => {
    const matchesSearch =
      search === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.description ?? "").toLowerCase().includes(search.toLowerCase()) ||
      p.tech_stack.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchesStage = stageFilter === "all" || p.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-h1 font-bold text-text-heading">Explore projects</h1>
        <p className="mt-2 text-body text-text-secondary">
          Find a project that needs your skills. Or post your own.
        </p>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="text"
              placeholder="Search projects, tech stack..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 w-full rounded-md border border-border-default bg-bg-input pl-9 pr-4 text-small text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {STAGES.map((stage) => (
              <button
                key={stage}
                type="button"
                onClick={() => setStageFilter(stage)}
                className={`cursor-pointer whitespace-nowrap rounded-md px-3 py-1.5 text-caption font-medium transition-colors duration-150 ${
                  stageFilter === stage
                    ? "bg-accent text-bg-base"
                    : "border border-border-default text-text-secondary hover:text-text-primary"
                }`}
              >
                {stage === "all"
                  ? "All"
                  : stage === "needs-help"
                    ? "Needs help"
                    : stage.charAt(0).toUpperCase() + stage.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                roles={p.roles}
                creatorName={p.creatorName}
              />
            ))}
          </div>
        ) : (
          <div className="mt-16 text-center">
            <p className="text-body text-text-secondary">
              No projects match your filters.
            </p>
            <p className="mt-2 text-small text-text-muted">
              Try a different search or clear filters.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
