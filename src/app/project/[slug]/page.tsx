"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { JoinRequestButton } from "@/components/JoinRequestButton";
import { useUser } from "@/components/useUser";
import {
  Clock,
  Globe,
  ExternalLink,
  MapPin,
  Loader2,
  Trash2,
} from "lucide-react";
import type { Project, ProjectRole } from "../../../../types/database";

const stageLabels: Record<string, string> = {
  idea: "Idea",
  "needs-help": "Needs help",
  building: "Building",
  launched: "Launched",
};

const stageColors: Record<string, string> = {
  idea: "bg-status-info/15 text-status-info",
  "needs-help": "bg-accent-muted text-accent",
  building: "bg-accent-muted text-accent",
  launched: "bg-status-success/15 text-status-success",
};

const splitBarColors = [
  "bg-accent",
  "bg-status-info",
  "bg-status-success",
  "bg-purple-500",
  "bg-pink-500",
];

type ApiProject = Project & {
  project_roles: ProjectRole[];
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
};

export default function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const { user, userId, loading: userLoading, unreadMessages } = useUser();
  const [project, setProject] = useState<ApiProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [joinStatus, setJoinStatus] = useState<"none" | "pending" | "accepted" | "rejected">("none");
  const [joinStatusLoading, setJoinStatusLoading] = useState(true);

  useEffect(() => {
    async function loadProject() {
      try {
        const res = await fetch(`/api/projects/${slug}`);
        if (res.ok) {
          setProject(await res.json());
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    }
    loadProject();
  }, [slug]);

  useEffect(() => {
    if (!userId || !project || userId === project.creator_id) {
      setJoinStatusLoading(false);
      return;
    }
    async function loadJoinStatus() {
      try {
        const joinRes = await fetch(`/api/projects/${slug}/join`);
        if (joinRes.ok) {
          const joinData: { status: string } = await joinRes.json();
          const s = joinData.status;
          if (s === "pending" || s === "accepted" || s === "rejected") {
            setJoinStatus(s);
          }
        }
      } catch {
        // join status check failed silently — leave as "none"
      }
      setJoinStatusLoading(false);
    }
    loadJoinStatus();
  }, [slug, userId, project?.creator_id]);

  async function handleDelete() {
    if (!window.confirm("Are you sure you want to delete this project? This cannot be undone.")) {
      return;
    }
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/projects/${slug}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/dashboard");
      } else {
        const err = await res.json().catch(() => ({ error: "Failed to delete project" }));
        setDeleteError(err.error ?? "Failed to delete project");
        setDeleting(false);
      }
    } catch {
      setDeleteError("Network error. Please try again.");
      setDeleting(false);
    }
  }

  if (loading) {
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

  if (notFound || !project) {
    return (
      <>
        <Nav user={user} loading={userLoading} unreadMessages={unreadMessages} />
        <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
          <h1 className="text-h1 font-bold text-text-heading">Project not found</h1>
          <p className="mt-2 text-body text-text-secondary">
            This project doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/explore"
            className="mt-6 text-small text-accent hover:text-accent-hover"
          >
            Browse projects
          </Link>
        </main>
        <Footer />
      </>
    );
  }

  const roles = project.project_roles;
  const creatorName = project.profiles?.username ?? "Unknown";

  return (
    <>
      <Nav user={user} loading={userLoading} unreadMessages={unreadMessages} />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 font-bold text-text-heading">{project.name}</h1>
            <p className="mt-1 text-small text-text-muted">
              by{" "}
              <Link
                href={`/u/${creatorName}`}
                className="text-accent hover:text-accent-hover"
              >
                {creatorName}
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-3">
            {project.github_repo_url && userId && (userId === project.creator_id || joinStatus === "accepted") && (
              <Link href={`/project/${project.slug}/workspace`}>
                <Button size="md">Go to Workspace</Button>
              </Link>
            )}
            <span
              className={`inline-flex items-center rounded-sm px-2.5 py-1 font-mono text-caption ${
                stageColors[project.stage] ?? "bg-bg-elevated text-text-muted"
              }`}
            >
              {stageLabels[project.stage] ?? project.stage}
            </span>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-small text-text-secondary">
          {project.target_launch && (
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-text-muted" />
              {project.target_launch}
            </span>
          )}
          {project.timezone && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-text-muted" />
              {project.timezone.replace(/_/g, " ")}
            </span>
          )}
          {project.business_model && (
            <span className="flex items-center gap-1.5">
              <Globe size={14} className="text-text-muted" />
              {project.business_model}
            </span>
          )}
          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-accent hover:text-accent-hover"
            >
              <ExternalLink size={14} />
              Live site
            </a>
          )}
        </div>

        {project.tech_stack.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.tech_stack.map((tech) => (
              <span
                key={tech}
                className="rounded-sm bg-bg-elevated px-2 py-0.5 font-mono text-caption text-text-muted"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {project.description && (
          <div className="mt-8">
            <h2 className="text-h3 font-semibold text-text-heading">About</h2>
            <p className="mt-3 whitespace-pre-line text-body leading-relaxed text-text-secondary">
              {project.description}
            </p>
          </div>
        )}

        {project.looking_for && (
          <div className="mt-8">
            <h2 className="text-h3 font-semibold text-text-heading">Looking for</h2>
            <p className="mt-3 whitespace-pre-line text-body leading-relaxed text-text-secondary">
              {project.looking_for}
            </p>
          </div>
        )}

        {project.roadmap.length > 0 && (
          <div className="mt-8">
            <h2 className="text-h3 font-semibold text-text-heading">Roadmap</h2>
            <ol className="mt-3 space-y-2">
              {project.roadmap.map((goal, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-muted font-mono text-caption font-bold text-accent">
                    {i + 1}
                  </span>
                  <span className="text-body text-text-secondary">{goal}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {roles.length > 0 && (
          <div className="mt-8">
            <h2 className="text-h3 font-semibold text-text-heading">Revenue split</h2>
            <div className="mt-4">
              <div className="flex h-3 overflow-hidden rounded-full bg-bg-elevated">
                {roles.map((role, i) => (
                  <div
                    key={role.id}
                    className={`${splitBarColors[i % splitBarColors.length]} transition-all duration-150`}
                    style={{ width: `${role.revenue_split}%` }}
                  />
                ))}
              </div>
              <div className="mt-3 space-y-2">
                {roles.map((role, i) => (
                  <div
                    key={role.id}
                    className="flex items-center justify-between rounded-md border border-border-subtle bg-bg-surface px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-block h-3 w-3 rounded-full ${splitBarColors[i % splitBarColors.length]}`}
                      />
                      <div>
                        <p className="text-small font-medium text-text-heading">
                          {role.role_title}
                        </p>
                        {role.description && (
                          <p className="text-caption text-text-muted">
                            {role.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-small text-text-heading">
                        {role.revenue_split}%
                      </span>
                      {role.filled ? (
                        <span className="rounded-sm bg-status-success/15 px-2 py-0.5 text-caption text-status-success">
                          Filled
                        </span>
                      ) : (
                        <span className="rounded-sm bg-accent-muted px-2 py-0.5 text-caption text-accent">
                          Open
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {user && userId && userId !== project.creator_id && !joinStatusLoading && (
          <div className="mt-10">
            {joinStatus === "none" && (
              <JoinRequestButton
                projectSlug={project.slug}
                projectName={project.name}
                openRoles={roles
                  .filter((r) => !r.filled)
                  .map((r) => r.role_title)}
                onSuccess={() => setJoinStatus("pending")}
              />
            )}
            {joinStatus === "pending" && (
              <p className="rounded-md bg-status-info/15 px-4 py-3 text-small text-status-info">
                Request pending — waiting for the creator to respond
              </p>
            )}
            {joinStatus === "accepted" && (
              <p className="rounded-md bg-status-success/15 px-4 py-3 text-small text-status-success">
                You&apos;re a collaborator on this project
              </p>
            )}
            {joinStatus === "rejected" && (
              <p className="rounded-md bg-status-error/15 px-4 py-3 text-small text-status-error">
                Your request to join was declined
              </p>
            )}
          </div>
        )}

        {user && userId && (userId === project.creator_id || joinStatus === "accepted") && (
          <div className="mt-6">
            <Link
              href={project.github_repo_url ? `/project/${project.slug}/workspace` : `/project/${project.slug}/terms`}
              className="text-small text-accent hover:text-accent-hover"
            >
              {project.github_repo_url ? "View Workspace" : "View Terms"} &rarr;
            </Link>
          </div>
        )}

        {user && userId && userId === project.creator_id && (
          <div className="mt-10 border-t border-border-subtle pt-6">
            <Button
              variant="danger"
              size="md"
              disabled={deleting}
              onClick={handleDelete}
            >
              <Trash2 size={16} />
              {deleting ? "Deleting..." : "Delete project"}
            </Button>
            {deleteError && (
              <p className="mt-2 text-small text-status-error">{deleteError}</p>
            )}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
