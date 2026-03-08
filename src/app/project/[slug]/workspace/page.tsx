"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { useUser } from "@/components/useUser";
import {
  Loader2,
  ExternalLink,
  Github,
  Globe,
  ArrowUp,
  Flag,
  AlertTriangle,
  CheckCircle,
  GitCommit,
  Rocket,
} from "lucide-react";
import type { WorkspaceTerm, Json } from "../../../../../types/database";

const splitBarColors = [
  "bg-accent",
  "bg-status-info",
  "bg-status-success",
  "bg-purple-500",
  "bg-pink-500",
];

const PLATFORM_FEE_PCT = 5;

const categoryIcons: Record<string, React.ReactNode> = {
  progress: <ArrowUp size={14} />,
  milestone: <Flag size={14} />,
  blocker: <AlertTriangle size={14} />,
  decision: <CheckCircle size={14} />,
  code: <GitCommit size={14} />,
  deploy: <Rocket size={14} />,
};

const categoryColors: Record<string, string> = {
  progress: "bg-accent-muted text-accent",
  milestone: "bg-status-success/15 text-status-success",
  blocker: "bg-status-error/15 text-status-error",
  decision: "bg-status-info/15 text-status-info",
  code: "bg-bg-elevated text-text-muted",
  deploy: "bg-purple-500/15 text-purple-400",
};

const categoryLabels: Record<string, string> = {
  progress: "Progress",
  milestone: "Milestone",
  blocker: "Blocker",
  decision: "Decision",
  code: "Code",
  deploy: "Deploy",
};

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return "yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;

  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

type WorkspaceTeamMember = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  role: string;
  revenue_split: number;
};

type WorkspaceProject = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  stage: string;
  github_repo_url: string | null;
  github_repo_full_name: string | null;
  live_url: string | null;
  vercel_project_id: string | null;
};

type TimelineEntry = {
  id: string;
  category: string;
  title: string;
  description: string | null;
  source: string;
  metadata: Json | null;
  created_at: string;
  user: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  } | null;
};

type WorkspaceResponse = {
  project: WorkspaceProject;
  team: WorkspaceTeamMember[];
  terms: WorkspaceTerm | null;
  timeline: TimelineEntry[];
};

export default function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user, loading: userLoading, unreadMessages } = useUser({
    redirectTo: "/login",
  });
  const [workspace, setWorkspace] = useState<WorkspaceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;
    if (!user) return;
    const controller = new AbortController();
    async function load() {
      try {
        const res = await fetch(`/api/workspace/${slug}`, {
          signal: controller.signal,
        });
        if (res.ok) {
          const data: WorkspaceResponse = await res.json();
          setWorkspace(data);
        } else if (res.status === 403) {
          setError("You don't have access to this workspace.");
        } else if (res.status === 404) {
          setError("Workspace not found.");
        } else {
          setError("Could not load workspace.");
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        setError("Failed to load workspace. Please try again.");
      }
      setLoading(false);
    }
    load();
    return () => controller.abort();
  }, [slug, userLoading, user?.username]);

  if (userLoading || loading) {
    return (
      <>
        <Nav user={user} loading={userLoading} unreadMessages={unreadMessages} />
        <main className="mx-auto flex max-w-3xl items-center justify-center px-4 py-24">
          <Loader2 size={24} className="animate-spin text-text-muted" />
        </main>
        <Footer />
      </>
    );
  }

  if (error || !workspace) {
    return (
      <>
        <Nav user={user} loading={userLoading} unreadMessages={unreadMessages} />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <Link
            href={`/project/${slug}`}
            className="text-small text-text-muted hover:text-text-primary"
          >
            &larr; Back to project
          </Link>
          <p role="alert" className="mt-8 text-body text-status-error">
            {error ?? "Workspace not found."}
          </p>
        </main>
        <Footer />
      </>
    );
  }

  const { project, team, terms, timeline } = workspace;
  const isSettingUp = !project.github_repo_url;

  const termsSplits: Record<string, number> | undefined =
    terms?.splits && typeof terms.splits === "object" && !Array.isArray(terms.splits)
      ? (terms.splits as Record<string, number>)
      : undefined;

  return (
    <>
      <Nav user={user} loading={userLoading} unreadMessages={unreadMessages} />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link
          href={`/project/${slug}`}
          className="text-small text-text-muted hover:text-text-primary"
        >
          &larr; Back to project
        </Link>

        <h1 className="mt-4 text-h1 font-bold text-text-heading">
          {project.name}
        </h1>
        {project.description && (
          <p className="mt-2 text-body text-text-secondary">
            {project.description}
          </p>
        )}

        {/* Setting up state */}
        {isSettingUp && (
          <div className="mt-8">
            <div className="flex items-center gap-3 rounded-lg border border-accent/30 bg-accent-muted px-5 py-4">
              <Loader2 size={18} className="animate-spin text-accent" />
              <div>
                <p className="text-small font-medium text-text-heading">
                  Setting up workspace...
                </p>
                <p className="mt-0.5 text-caption text-text-muted">
                  GitHub repository and deployment are being configured.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active workspace — infrastructure cards */}
        {!isSettingUp && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <a
              href={project.github_repo_url ?? ""}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-lg border border-border-default bg-bg-surface p-4 transition-all duration-150 hover:border-border-strong hover:shadow-md"
            >
              <Github size={20} className="mt-0.5 shrink-0 text-text-muted group-hover:text-text-primary" />
              <div className="min-w-0">
                <p className="text-small font-medium text-text-heading group-hover:text-accent">
                  GitHub Repository
                </p>
                <p className="mt-1 truncate font-mono text-caption text-text-muted">
                  {project.github_repo_full_name}
                </p>
              </div>
              <ExternalLink size={14} className="ml-auto mt-0.5 shrink-0 text-text-muted" />
            </a>

            {project.live_url ? (
              <a
                href={project.live_url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-3 rounded-lg border border-border-default bg-bg-surface p-4 transition-all duration-150 hover:border-border-strong hover:shadow-md"
              >
                <Globe size={20} className="mt-0.5 shrink-0 text-status-success group-hover:text-status-success" />
                <div className="min-w-0">
                  <p className="text-small font-medium text-text-heading group-hover:text-accent">
                    Live Site
                  </p>
                  <p className="mt-1 truncate font-mono text-caption text-text-muted">
                    {project.live_url}
                  </p>
                </div>
                <ExternalLink size={14} className="ml-auto mt-0.5 shrink-0 text-text-muted" />
              </a>
            ) : (
              <div className="flex items-start gap-3 rounded-lg border border-border-subtle bg-bg-surface p-4">
                <Globe size={20} className="mt-0.5 shrink-0 text-text-muted" />
                <div>
                  <p className="text-small font-medium text-text-heading">
                    Live Site
                  </p>
                  <p className="mt-1 text-caption text-text-muted">
                    Not deployed yet
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Team */}
        <div className="mt-8">
          <h2 className="text-h3 font-semibold text-text-heading">Team</h2>

          {termsSplits && team.length > 0 && (
            <div className="mt-4">
              <div className="flex h-3 overflow-hidden rounded-full bg-bg-elevated">
                {team.map((member, i) => {
                  const pct = termsSplits[member.id] ?? 0;
                  if (pct === 0) return null;
                  return (
                    <div
                      key={member.id}
                      className={`${splitBarColors[i % splitBarColors.length]} transition-all duration-150`}
                      style={{ width: `${pct}%` }}
                    />
                  );
                })}
                <div
                  className="bg-text-muted/30 transition-all duration-150"
                  style={{ width: `${PLATFORM_FEE_PCT}%` }}
                />
              </div>
              <div className="mt-1 flex justify-end">
                <span className="text-caption text-text-muted">{PLATFORM_FEE_PCT}% platform</span>
              </div>
            </div>
          )}

          <div className="mt-4 space-y-2">
            {team.map((member, i) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-border-subtle bg-bg-surface px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block h-3 w-3 rounded-full ${splitBarColors[i % splitBarColors.length]}`}
                  />
                  <div>
                    <Link
                      href={`/u/${member.username}`}
                      className="text-small font-medium text-text-heading hover:text-accent"
                    >
                      {member.display_name ?? member.username}
                    </Link>
                    <p className="text-caption text-text-muted">
                      {member.role}
                    </p>
                  </div>
                </div>
                {termsSplits && (
                  <span className="font-mono text-small text-text-heading">
                    {termsSplits[member.id] ?? 0}%
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="mt-8">
          <h2 className="text-h3 font-semibold text-text-heading">Timeline</h2>

          <PostUpdateForm
            slug={slug}
            user={user}
            onPost={(entry) =>
              setWorkspace((prev) =>
                prev ? { ...prev, timeline: [entry, ...prev.timeline] } : prev
              )
            }
          />

          {timeline.length > 0 ? (
            <div className="mt-6 space-y-3">
              {timeline.map((entry) => (
                <TimelineCard key={entry.id} entry={entry} />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
              <p className="text-body text-text-secondary">
                No activity yet. Post your first update to get started.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function PostUpdateForm({
  slug,
  user,
  onPost,
}: {
  slug: string;
  user: { username: string; avatar_url: string } | null;
  onPost: (entry: TimelineEntry) => void;
}) {
  const [category, setCategory] = useState("progress");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/workspace/${slug}/updates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title: title.trim(),
          description: description.trim() || null,
        }),
      });

      if (res.ok) {
        const data: { id: string; created_at: string } = await res.json();
        const newEntry: TimelineEntry = {
          id: data.id,
          category,
          title: title.trim(),
          description: description.trim() || null,
          source: "web",
          metadata: null,
          created_at: data.created_at,
          user: user
            ? { username: user.username, display_name: null, avatar_url: user.avatar_url }
            : null,
        };
        onPost(newEntry);
        setTitle("");
        setDescription("");
        setCategory("progress");
      } else {
        const err: { error?: string } = await res.json().catch(() => ({ error: "Something went wrong" }));
        setError(err.error ?? "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-3 rounded-lg border border-border-subtle bg-bg-surface p-4">
      <div className="flex gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Update category"
          className="h-10 rounded-md border border-border-default bg-bg-input px-3 text-small text-text-primary focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
        >
          <option value="progress">Progress</option>
          <option value="milestone">Milestone</option>
          <option value="blocker">Blocker</option>
          <option value="decision">Decision</option>
        </select>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What did you work on?"
          maxLength={120}
          required
          aria-label="Update title"
          className="h-10 flex-1 rounded-md border border-border-default bg-bg-input px-3 text-small text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Add details (optional)"
        rows={2}
        aria-label="Update description"
        className="w-full rounded-md border border-border-default bg-bg-input px-3 py-2 text-small text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <div className="flex items-center justify-between">
        {error && (
          <p role="alert" className="text-caption text-status-error">{error}</p>
        )}
        <div className="ml-auto">
          <Button type="submit" size="sm" disabled={submitting || !title.trim()}>
            {submitting ? "Posting..." : "Post Update"}
          </Button>
        </div>
      </div>
    </form>
  );
}

function SourceBadge({ source }: { source: string }) {
  const isAmber = source === "mcp";
  return (
    <span
      className={`inline-flex items-center rounded-sm px-1.5 py-0.5 text-caption ${
        isAmber
          ? "bg-accent/10 text-accent"
          : "bg-bg-elevated text-text-muted"
      }`}
    >
      via {source === "mcp" ? "MCP" : source === "github" ? "GitHub" : source === "vercel" ? "Vercel" : "web"}
    </span>
  );
}

function TimelineCard({ entry }: { entry: TimelineEntry }) {
  const icon = categoryIcons[entry.category] ?? <ArrowUp size={14} />;
  const colorClass = categoryColors[entry.category] ?? "bg-bg-elevated text-text-muted";
  const label = categoryLabels[entry.category] ?? entry.category;
  const authorName = entry.user?.display_name ?? entry.user?.username ?? "System";

  return (
    <div className="rounded-lg border border-border-subtle bg-bg-surface px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className={`mt-0.5 inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-caption ${colorClass}`}>
            {icon}
            {label}
          </span>
          <div className="min-w-0">
            <p className="text-small font-medium text-text-heading">
              {entry.title}
            </p>
            {entry.description && (
              <p className="mt-1 whitespace-pre-line text-small text-text-secondary">
                {entry.description}
              </p>
            )}
          </div>
        </div>
        <SourceBadge source={entry.source} />
      </div>
      <div className="mt-2 flex items-center gap-2 text-caption text-text-muted">
        <span>{authorName}</span>
        <span>&middot;</span>
        <span>{relativeTime(entry.created_at)}</span>
      </div>
    </div>
  );
}
