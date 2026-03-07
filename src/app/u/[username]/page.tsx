"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { useUser } from "@/components/useUser";
import { Briefcase, Github, ExternalLink, CheckCircle, Loader2 } from "lucide-react";

type ProfileProject = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  stage: string;
  tech_stack: string[];
  created_at: string;
  project_roles: {
    id: string;
    role_title: string;
    role_type: string;
    revenue_split: number;
    filled: boolean;
  }[];
};

type ProfileData = {
  id: string;
  username: string;
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  skills: string[];
  roles: string[];
  revenue_tier: string | null;
  privacy_revenue: boolean;
  privacy_projects: boolean;
  privacy_activity: boolean;
  created_at: string;
  projects: ProfileProject[] | null;
};

const roleLabels: Record<string, string> = {
  code: "Developer",
  design: "Designer",
  marketing: "Marketer",
  product: "Product",
  operations: "Operations",
};

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

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = use(params);
  const { user, loading: userLoading, unreadMessages } = useUser();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/profiles/${username}`);
      if (res.ok) {
        const data: ProfileData = await res.json();
        setProfile(data);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    load();
  }, [username]);

  if (loading) {
    return (
      <>
        <Nav user={user} loading={userLoading} unreadMessages={unreadMessages} />
        <main className="mx-auto flex max-w-4xl items-center justify-center px-4 py-24">
          <Loader2 size={24} className="animate-spin text-text-muted" />
        </main>
        <Footer />
      </>
    );
  }

  if (notFound || !profile) {
    return (
      <>
        <Nav user={user} loading={userLoading} unreadMessages={unreadMessages} />
        <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
          <h1 className="text-h1 font-bold text-text-heading">User not found</h1>
          <p className="mt-2 text-body text-text-secondary">
            This profile doesn&apos;t exist.
          </p>
        </main>
        <Footer />
      </>
    );
  }

  const projects = profile.projects ?? [];

  return (
    <>
      <Nav user={user} loading={userLoading} unreadMessages={unreadMessages} />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <img
            src={profile.avatar_url ?? `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${profile.username}`}
            alt={profile.username}
            className="h-24 w-24 rounded-full border-2 border-border-default bg-bg-elevated"
          />
          <div className="flex-1">
            <h1 className="text-h1 font-bold text-text-heading">
              {profile.display_name ?? profile.username}
            </h1>
            <p className="mt-0.5 text-small text-text-muted">@{profile.username}</p>

            {profile.bio && (
              <p className="mt-3 max-w-xl text-body leading-relaxed text-text-secondary">
                {profile.bio}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-small text-text-muted">
              {(profile.roles?.length ?? 0) > 0 && (
                <span className="flex items-center gap-1.5">
                  <Briefcase size={14} />
                  {(profile.roles ?? []).map((r) => roleLabels[r] ?? r).join(", ")}
                </span>
              )}
            </div>

            {(profile.skills?.length ?? 0) > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {(profile.skills ?? []).map((skill) => (
                  <span
                    key={skill}
                    className="rounded-sm bg-bg-elevated px-2 py-0.5 font-mono text-caption text-text-muted"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-10">
          <h2 className="text-h3 font-semibold text-text-heading">Projects</h2>
          {projects.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {projects.map((p) => (
                <a
                  key={p.id}
                  href={`/project/${p.slug}`}
                  className="group block rounded-lg border border-border-default bg-bg-surface p-4 transition-all duration-150 hover:scale-[1.01] hover:border-border-strong hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-h3 font-semibold text-text-heading group-hover:text-accent">
                      {p.name}
                    </h3>
                    <span
                      className={`inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-caption ${
                        stageColors[p.stage] ?? "bg-bg-elevated text-text-muted"
                      }`}
                    >
                      {stageLabels[p.stage] ?? p.stage}
                    </span>
                  </div>
                  {p.description && (
                    <p className="mt-2 line-clamp-2 text-small text-text-secondary">
                      {p.description}
                    </p>
                  )}
                  {p.tech_stack.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {p.tech_stack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-sm bg-bg-elevated px-2 py-0.5 font-mono text-caption text-text-muted"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-body text-text-muted">
              No public projects yet.
            </p>
          )}
        </div>

        <div className="mt-10">
          <h2 className="text-h3 font-semibold text-text-heading">Activity</h2>
          <div className="mt-4 rounded-lg border border-border-subtle bg-bg-surface p-8 text-center">
            <p className="text-small text-text-muted">
              Contribution activity will appear here once workspaces are active.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
