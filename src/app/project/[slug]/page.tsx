import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { JoinRequestButton } from "@/components/JoinRequestButton";
import {
  Clock,
  Globe,
  ExternalLink,
  MapPin,
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

// TODO: Replace with real data fetch from Agent 1's API
async function getProject(slug: string): Promise<{
  project: Project;
  roles: ProjectRole[];
  creatorName: string;
  lookingFor: string;
} | null> {
  const mockProjects: Record<
    string,
    { project: Project; roles: ProjectRole[]; creatorName: string; lookingFor: string }
  > = {
    "clanka-chat-k8m2x4": {
      project: {
        id: "1",
        slug: "clanka-chat-k8m2x4",
        creator_id: "u1",
        name: "clanka.chat",
        description:
          "The platform where vibecoders find co-builders, form micro-startups, and split revenue. We handle the infrastructure — repos, deploys, payments — so you can focus on building.\n\nLooking for a frontend dev to polish the UI and a growth marketer to help with launch strategy.",
        stage: "building",
        tech_stack: ["Next.js", "Supabase", "Stripe", "Vercel", "TypeScript"],
        business_model: "Platform fee (5%)",
        domain_plan: null,
        time_commitment: "20+ hrs/week",
        timezone: "America/New_York",
        is_public: true,
        github_repo_name: null,
        github_repo_full_name: null,
        github_repo_url: null,
        vercel_project_id: null,
        vercel_deploy_hook_url: null,
        live_url: null,
        created_at: "2026-03-01T00:00:00Z",
        updated_at: "2026-03-06T00:00:00Z",
      },
      roles: [
        { id: "r1", project_id: "1", role_title: "Creator", role_type: "code", description: "Full-stack development, architecture, and platform design", revenue_split: 50, filled: true, filled_by: "u1", created_at: "2026-03-01T00:00:00Z" },
        { id: "r2", project_id: "1", role_title: "Frontend Dev", role_type: "code", description: "React/Next.js UI development, component library, responsive design", revenue_split: 30, filled: false, filled_by: null, created_at: "2026-03-01T00:00:00Z" },
        { id: "r3", project_id: "1", role_title: "Growth Marketer", role_type: "marketing", description: "Launch strategy, content marketing, community building", revenue_split: 20, filled: false, filled_by: null, created_at: "2026-03-01T00:00:00Z" },
      ],
      creatorName: "spaghettipete",
      lookingFor: "Frontend dev (React/Next.js) and growth marketer. Must be comfortable with AI tools and fast iteration.",
    },
  };

  return mockProjects[slug] ?? null;
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getProject(slug);

  if (!data) {
    return (
      <>
        <Nav />
        <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center">
          <h1 className="text-h1 font-bold text-text-heading">Project not found</h1>
          <p className="mt-2 text-body text-text-secondary">
            This project doesn&apos;t exist or has been removed.
          </p>
        </main>
        <Footer />
      </>
    );
  }

  const { project, roles, creatorName, lookingFor } = data;

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-h1 font-bold text-text-heading">{project.name}</h1>
            <p className="mt-1 text-small text-text-muted">by {creatorName}</p>
          </div>
          <span
            className={`inline-flex items-center rounded-sm px-2.5 py-1 font-mono text-caption ${
              stageColors[project.stage] ?? "bg-bg-elevated text-text-muted"
            }`}
          >
            {stageLabels[project.stage] ?? project.stage}
          </span>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-small text-text-secondary">
          {project.time_commitment && (
            <span className="flex items-center gap-1.5">
              <Clock size={14} className="text-text-muted" />
              {project.time_commitment}
            </span>
          )}
          {project.timezone && (
            <span className="flex items-center gap-1.5">
              <MapPin size={14} className="text-text-muted" />
              {project.timezone}
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

        <div className="mt-8">
          <h2 className="text-h3 font-semibold text-text-heading">Looking for</h2>
          <p className="mt-3 text-body text-text-secondary">{lookingFor}</p>
        </div>

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

        {roles.some((r) => !r.filled) && (
          <div className="mt-10">
            <JoinRequestButton
              projectSlug={project.slug}
              projectName={project.name}
              openRoles={roles
                .filter((r) => !r.filled)
                .map((r) => r.role_title)}
            />
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
