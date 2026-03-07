import Link from "next/link";
import type { Project, ProjectRole } from "../../types/database";

type ProjectCardProject = Pick<
  Project,
  "id" | "slug" | "name" | "description" | "stage" | "tech_stack"
>;

type ProjectCardProps = {
  project: ProjectCardProject;
  roles?: ProjectRole[];
  creatorName?: string;
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

function StageBadge({ stage }: { stage: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-sm px-2 py-0.5 font-mono text-caption ${
        stageColors[stage] ?? "bg-bg-elevated text-text-muted"
      }`}
    >
      {stageLabels[stage] ?? stage}
    </span>
  );
}

function RevenueSplitBar({ roles }: { roles: ProjectRole[] }) {
  const filledRoles = roles.filter((r) => r.revenue_split > 0);
  if (filledRoles.length === 0) return null;

  const colors = [
    "bg-accent",
    "bg-status-info",
    "bg-status-success",
    "bg-purple-500",
    "bg-pink-500",
  ];

  return (
    <div className="mt-3">
      <div className="flex h-2 overflow-hidden rounded-full bg-bg-elevated">
        {filledRoles.map((role, i) => (
          <div
            key={role.id}
            className={`${colors[i % colors.length]} transition-all duration-150`}
            style={{ width: `${role.revenue_split}%` }}
            title={`${role.role_title}: ${role.revenue_split}%`}
          />
        ))}
      </div>
      <div className="mt-1.5 flex gap-3">
        {filledRoles.map((role, i) => (
          <span key={role.id} className="flex items-center gap-1 text-caption text-text-muted">
            <span
              className={`inline-block h-2 w-2 rounded-full ${colors[i % colors.length]}`}
            />
            {role.role_title} {role.revenue_split}%
          </span>
        ))}
      </div>
    </div>
  );
}

export function ProjectCard({ project, roles = [], creatorName }: ProjectCardProps) {
  return (
    <Link
      href={`/project/${project.slug}`}
      className="group block rounded-lg border border-border-default bg-bg-surface p-4 transition-all duration-150 hover:scale-[1.01] hover:border-border-strong hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-h3 font-semibold text-text-heading group-hover:text-accent">
          {project.name}
        </h3>
        <StageBadge stage={project.stage} />
      </div>

      {project.description && (
        <p className="mt-2 line-clamp-2 text-small text-text-secondary">
          {project.description}
        </p>
      )}

      {project.tech_stack.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
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

      <RevenueSplitBar roles={roles} />

      {creatorName && (
        <p className="mt-3 text-caption text-text-muted">by {creatorName}</p>
      )}
    </Link>
  );
}
