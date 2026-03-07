import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ProjectCard } from "@/components/ProjectCard";
import { Briefcase, Github, ExternalLink, CheckCircle } from "lucide-react";
import type { Profile, Project, ProjectRole } from "../../../../types/database";

async function getProfile(username: string): Promise<{
  profile: Profile;
  projects: (Project & { roles: ProjectRole[]; creatorName: string })[];
} | null> {
  const mockProfiles: Record<
    string,
    {
      profile: Profile;
      projects: (Project & { roles: ProjectRole[]; creatorName: string })[];
    }
  > = {
    spaghettipete: {
      profile: {
        id: "u1",
        username: "spaghettipete",
        display_name: "Pete",
        bio: "Full-stack vibecoder. Building clanka.chat — the platform for AI-native builders who want co-founders, not job listings.",
        avatar_url: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=spaghettipete",
        skills: ["TypeScript", "Next.js", "Supabase", "Product Design"],
        roles: ["code", "product"],
        github_username: "spaghettipete",
        stripe_connected: true,
        stripe_account_id: "acct_mock",
        revenue_tier: null,
        privacy_revenue: false,
        privacy_projects: false,
        privacy_activity: false,
        api_key: null,
        created_at: "2026-03-01T00:00:00Z",
        updated_at: "2026-03-06T00:00:00Z",
      },
      projects: [
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
        },
      ],
    },
  };

  return mockProfiles[username] ?? null;
}

const roleLabels: Record<string, string> = {
  code: "Developer",
  design: "Designer",
  marketing: "Marketer",
  product: "Product",
  operations: "Operations",
};

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const data = await getProfile(username);

  if (!data) {
    return (
      <>
        <Nav />
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

  const { profile, projects } = data;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="flex flex-col items-start gap-6 sm:flex-row">
          <img
            src={profile.avatar_url ?? `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${profile.username}`}
            alt={profile.username}
            className="h-24 w-24 rounded-full border-2 border-border-default bg-bg-elevated"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-h1 font-bold text-text-heading">
                {profile.display_name ?? profile.username}
              </h1>
              {profile.stripe_connected && (
                <span className="flex items-center gap-1 rounded-sm bg-status-success/15 px-2 py-0.5 text-caption text-status-success">
                  <CheckCircle size={12} />
                  Stripe
                </span>
              )}
            </div>
            <p className="mt-0.5 text-small text-text-muted">@{profile.username}</p>

            {profile.bio && (
              <p className="mt-3 max-w-xl text-body leading-relaxed text-text-secondary">
                {profile.bio}
              </p>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-small text-text-muted">
              {profile.github_username && (
                <a
                  href={`https://github.com/${profile.github_username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 transition-colors duration-150 hover:text-text-primary"
                >
                  <Github size={14} />
                  {profile.github_username}
                  <ExternalLink size={10} />
                </a>
              )}
              {profile.roles.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <Briefcase size={14} />
                  {profile.roles.map((r) => roleLabels[r] ?? r).join(", ")}
                </span>
              )}
            </div>

            {profile.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {profile.skills.map((skill) => (
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
                <ProjectCard
                  key={p.id}
                  project={p}
                  roles={p.roles}
                  creatorName={p.creatorName}
                />
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
