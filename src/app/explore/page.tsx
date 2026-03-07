"use client";

import { useState, useEffect } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { ProjectCard } from "@/components/ProjectCard";
import { useUser } from "@/components/useUser";
import { Search, Loader2 } from "lucide-react";
import type { Project, ProjectRole } from "../../../types/database";

const STAGES = ["all", "idea", "needs-help", "building", "launched"] as const;

type ApiProject = Project & {
  project_roles: ProjectRole[];
  profiles: {
    username: string;
    display_name: string | null;
    avatar_url: string | null;
  };
};

export default function ExplorePage() {
  const { user, loading: userLoading } = useUser();
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [projects, setProjects] = useState<ApiProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const params = new URLSearchParams();
      if (stageFilter !== "all") params.set("stage", stageFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/projects?${params.toString()}`);
      if (res.ok) {
        const data: ApiProject[] = await res.json();
        setProjects(data);
      }
      setLoading(false);
    }
    load();
  }, [stageFilter, search]);

  return (
    <>
      <Nav user={user} loading={userLoading} />
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
                className={`cursor-pointer whitespace-nowrap rounded-md border px-3 py-1.5 text-caption font-medium transition-colors duration-150 ${
                  stageFilter === stage
                    ? "border-accent bg-accent text-bg-base"
                    : "border-border-default text-text-secondary hover:text-text-primary"
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

        {loading ? (
          <div className="mt-16 flex justify-center">
            <Loader2 size={24} className="animate-spin text-text-muted" />
          </div>
        ) : projects.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                project={p}
                roles={p.project_roles}
                creatorName={p.profiles?.username}
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
