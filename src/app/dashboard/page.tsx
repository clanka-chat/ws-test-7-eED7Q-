"use client";

import { useState } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { ProjectCard } from "@/components/ProjectCard";
import {
  Plus,
  Clock,
  DollarSign,
  TrendingUp,
  Bell,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type { Project, ProjectRole, JoinRequest } from "../../../types/database";

type DashboardProject = Project & {
  roles: ProjectRole[];
  creatorName: string;
  myRole: string;
};

type PendingRequest = JoinRequest & {
  projectName: string;
  projectSlug: string;
  requesterName?: string;
};

const MOCK_USER = {
  username: "spaghettipete",
  avatar_url: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=spaghettipete",
};

const MOCK_PROJECTS: DashboardProject[] = [
  {
    id: "1",
    slug: "clanka-chat-k8m2x4",
    creator_id: "u1",
    name: "clanka.chat",
    description:
      "The platform where vibecoders find co-builders, form micro-startups, and split revenue.",
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
    myRole: "Creator",
  },
];

const MOCK_INCOMING_REQUESTS: PendingRequest[] = [
  {
    id: "jr1",
    project_id: "1",
    requester_id: "u7",
    status: "pending",
    message: "I'd love to help with the frontend! I have 3 years of React/Next.js experience.",
    created_at: "2026-03-06T14:00:00Z",
    updated_at: "2026-03-06T14:00:00Z",
    projectName: "clanka.chat",
    projectSlug: "clanka-chat-k8m2x4",
    requesterName: "reactrachel",
  },
];

const MOCK_OUTGOING_REQUESTS: PendingRequest[] = [];

const MOCK_EARNINGS = {
  totalEarned: 0,
  thisMonth: 0,
  pendingPayout: 0,
};

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"projects" | "requests">("projects");

  return (
    <>
      <Nav user={MOCK_USER} />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 font-bold text-text-heading">Dashboard</h1>
            <p className="mt-1 text-body text-text-secondary">
              Your projects, requests, and earnings at a glance.
            </p>
          </div>
          <Link href="/new">
            <Button size="md">
              <Plus size={16} />
              New Project
            </Button>
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
            <div className="flex items-center gap-2 text-text-muted">
              <DollarSign size={16} />
              <span className="text-caption font-medium">Total Earned</span>
            </div>
            <p className="mt-2 font-mono text-h2 font-bold text-text-heading">
              ${MOCK_EARNINGS.totalEarned.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
            <div className="flex items-center gap-2 text-text-muted">
              <TrendingUp size={16} />
              <span className="text-caption font-medium">This Month</span>
            </div>
            <p className="mt-2 font-mono text-h2 font-bold text-text-heading">
              ${MOCK_EARNINGS.thisMonth.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
            <div className="flex items-center gap-2 text-text-muted">
              <Clock size={16} />
              <span className="text-caption font-medium">Pending Payout</span>
            </div>
            <p className="mt-2 font-mono text-h2 font-bold text-text-heading">
              ${MOCK_EARNINGS.pendingPayout.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="mt-8 flex gap-4 border-b border-border-subtle">
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`cursor-pointer border-b-2 px-1 pb-3 text-small font-medium transition-colors duration-150 ${
              activeTab === "projects"
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            Active Projects ({MOCK_PROJECTS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={`cursor-pointer border-b-2 px-1 pb-3 text-small font-medium transition-colors duration-150 ${
              activeTab === "requests"
                ? "border-accent text-accent"
                : "border-transparent text-text-muted hover:text-text-primary"
            }`}
          >
            Requests
            {MOCK_INCOMING_REQUESTS.length > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-caption font-bold text-bg-base">
                {MOCK_INCOMING_REQUESTS.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "projects" && (
          <div className="mt-6">
            {MOCK_PROJECTS.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {MOCK_PROJECTS.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    roles={p.roles}
                    creatorName={p.creatorName}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-border-subtle bg-bg-surface p-12 text-center">
                <p className="text-body text-text-secondary">
                  You don&apos;t have any active projects yet.
                </p>
                <p className="mt-2 text-small text-text-muted">
                  Post your own project or join an existing one from Explore.
                </p>
                <div className="mt-6 flex justify-center gap-3">
                  <Link href="/new">
                    <Button size="md">Post a Project</Button>
                  </Link>
                  <Link href="/explore">
                    <Button variant="secondary" size="md">
                      Explore
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "requests" && (
          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-small font-medium text-text-heading">
                Incoming Requests
              </h3>
              {MOCK_INCOMING_REQUESTS.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {MOCK_INCOMING_REQUESTS.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-lg border border-border-default bg-bg-surface p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-small text-text-heading">
                            <span className="font-medium text-accent">
                              {req.requesterName}
                            </span>{" "}
                            wants to join{" "}
                            <Link
                              href={`/project/${req.projectSlug}`}
                              className="font-medium text-text-heading hover:text-accent"
                            >
                              {req.projectName}
                            </Link>
                          </p>
                          {req.message && (
                            <p className="mt-2 text-small text-text-secondary">
                              &ldquo;{req.message}&rdquo;
                            </p>
                          )}
                          <p className="mt-2 text-caption text-text-muted">
                            {new Date(req.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-2">
                          <Button size="sm" variant="primary">
                            <CheckCircle size={14} />
                            Accept
                          </Button>
                          <Button size="sm" variant="ghost">
                            <XCircle size={14} />
                            Decline
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-small text-text-muted">
                  No incoming requests.
                </p>
              )}
            </div>

            <div>
              <h3 className="text-small font-medium text-text-heading">
                Your Requests
              </h3>
              {MOCK_OUTGOING_REQUESTS.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {MOCK_OUTGOING_REQUESTS.map((req) => (
                    <div
                      key={req.id}
                      className="rounded-lg border border-border-default bg-bg-surface p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-small text-text-heading">
                          Request to join{" "}
                          <Link
                            href={`/project/${req.projectSlug}`}
                            className="font-medium text-text-heading hover:text-accent"
                          >
                            {req.projectName}
                          </Link>
                        </p>
                        <span className="rounded-sm bg-accent-muted px-2 py-0.5 text-caption text-accent">
                          Pending
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-small text-text-muted">
                  You haven&apos;t sent any join requests.
                </p>
              )}
            </div>

            <div>
              <h3 className="flex items-center gap-2 text-small font-medium text-text-heading">
                <Bell size={14} />
                Notifications
              </h3>
              <div className="mt-3 rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
                <p className="text-small text-text-muted">
                  No new notifications.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
