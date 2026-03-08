"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useUser } from "@/components/useUser";
import { Loader2, ExternalLink, Github, Globe } from "lucide-react";
import type { WorkspaceTerm } from "../../../../../types/database";

const splitBarColors = [
  "bg-accent",
  "bg-status-info",
  "bg-status-success",
  "bg-purple-500",
  "bg-pink-500",
];

const PLATFORM_FEE_PCT = 5;

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

type WorkspaceResponse = {
  project: WorkspaceProject;
  team: WorkspaceTeamMember[];
  terms: WorkspaceTerm | null;
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
    async function load() {
      try {
        const res = await fetch(`/api/workspace/${slug}`);
        if (res.ok) {
          const data: WorkspaceResponse = await res.json();
          setWorkspace(data);
        } else {
          setError("Could not load workspace.");
        }
      } catch {
        setError("Failed to load workspace. Please try again.");
      }
      setLoading(false);
    }
    load();
  }, [slug, userLoading, user]);

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

  const { project, team, terms } = workspace;
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
              href={project.github_repo_url!}
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
      </main>
      <Footer />
    </>
  );
}
