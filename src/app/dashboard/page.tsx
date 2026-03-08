"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { ProjectCard } from "@/components/ProjectCard";
import { useUser } from "@/components/useUser";
import {
  Plus,
  Clock,
  DollarSign,
  TrendingUp,
  Bell,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";
import type { ProjectRole } from "../../../types/database";

type DashboardProjectRole = ProjectRole;

type DashboardProject = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  stage: string;
  tech_stack: string[];
  created_at: string;
  project_roles: DashboardProjectRole[];
};

type DashboardCollaboration = {
  role: string;
  revenue_split: number;
  projects: {
    id: string;
    slug: string;
    name: string;
    stage: string;
  };
};

type PendingRequest = {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  projects: { slug: string; name: string };
  profiles: { username: string; display_name: string | null; avatar_url: string | null };
};

type OutgoingRequest = {
  id: string;
  status: string;
  message: string | null;
  created_at: string;
  projects: { slug: string; name: string };
};

type DashboardData = {
  my_projects: DashboardProject[];
  collaborations: DashboardCollaboration[];
  pending_requests: PendingRequest[];
  my_requests: OutgoingRequest[];
  earnings: { total: number; this_month: number; currency: string };
};

export default function DashboardPage() {
  const { user, loading: userLoading, unreadMessages } = useUser({ redirectTo: "/login" });
  const [activeTab, setActiveTab] = useState<"projects" | "requests">("projects");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json: DashboardData = await res.json();
        setData(json);
      }
      setLoading(false);
    }
    if (!userLoading && user) {
      load();
    }
  }, [userLoading, user]);

  async function handleRequest(requestId: string, status: "accepted" | "rejected") {
    setProcessingRequest(requestId);
    try {
      const res = await fetch(`/api/join-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok && data) {
        setData({
          ...data,
          pending_requests: data.pending_requests.filter((r) => r.id !== requestId),
        });
      }
    } catch {
      // silently fail — user can retry
    } finally {
      setProcessingRequest(null);
    }
  }

  if (userLoading || loading) {
    return (
      <>
        <Nav user={user} loading={userLoading} unreadMessages={unreadMessages} />
        <main className="mx-auto flex max-w-6xl items-center justify-center px-4 py-24">
          <Loader2 size={24} className="animate-spin text-text-muted" />
        </main>
        <Footer />
      </>
    );
  }

  const myProjects = data?.my_projects ?? [];
  const collaborations = data?.collaborations ?? [];
  const pendingRequests = data?.pending_requests ?? [];
  const myRequests = data?.my_requests ?? [];
  const earnings = data?.earnings ?? { total: 0, this_month: 0, currency: "USD" };
  const hasProjects = myProjects.length + collaborations.length > 0;

  return (
    <>
      <Nav user={user} loading={userLoading} unreadMessages={unreadMessages} />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-h1 font-bold text-text-heading">Dashboard</h1>
            <p className="mt-1 text-body text-text-secondary">
              Your projects, requests, and earnings at a glance.
            </p>
          </div>
          {hasProjects && (
            <Link href="/new">
              <Button size="md">
                <Plus size={16} />
                New Project
              </Button>
            </Link>
          )}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
            <div className="flex items-center gap-2 text-text-muted">
              <DollarSign size={16} />
              <span className="text-caption font-medium">Total Earned</span>
            </div>
            <p className="mt-2 font-mono text-h2 font-bold text-text-heading">
              ${earnings.total.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
            <div className="flex items-center gap-2 text-text-muted">
              <TrendingUp size={16} />
              <span className="text-caption font-medium">This Month</span>
            </div>
            <p className="mt-2 font-mono text-h2 font-bold text-text-heading">
              ${earnings.this_month.toFixed(2)}
            </p>
          </div>
          <div className="rounded-lg border border-border-subtle bg-bg-surface p-4">
            <div className="flex items-center gap-2 text-text-muted">
              <Clock size={16} />
              <span className="text-caption font-medium">Active Projects</span>
            </div>
            <p className="mt-2 font-mono text-h2 font-bold text-text-heading">
              {myProjects.length + collaborations.length}
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
            Projects ({myProjects.length + collaborations.length})
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
            {pendingRequests.length > 0 && (
              <span className="ml-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent text-caption font-bold text-bg-base">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>

        {activeTab === "projects" && (
          <div className="mt-6">
            {hasProjects ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {myProjects.map((p) => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    roles={p.project_roles}
                  />
                ))}
                {collaborations.filter((c) => c.projects).map((c) => (
                  <Link
                    key={c.projects.id}
                    href={`/project/${c.projects.slug}`}
                    className="group block rounded-lg border border-border-default bg-bg-surface p-4 transition-all duration-150 hover:scale-[1.01] hover:border-border-strong hover:shadow-md"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-h3 font-semibold text-text-heading group-hover:text-accent">
                        {c.projects.name}
                      </h3>
                    </div>
                    <p className="mt-2 text-small text-text-muted">
                      {c.role} &middot; {c.revenue_split}% split
                    </p>
                  </Link>
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
              {pendingRequests.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {pendingRequests.filter((req) => req.projects).map((req) => (
                    <div
                      key={req.id}
                      className="rounded-lg border border-border-default bg-bg-surface p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-small text-text-heading">
                            <span className="font-medium text-accent">
                              {req.profiles.display_name ?? req.profiles.username}
                            </span>{" "}
                            wants to join{" "}
                            <Link
                              href={`/project/${req.projects.slug}`}
                              className="font-medium text-text-heading hover:text-accent"
                            >
                              {req.projects.name}
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
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={processingRequest === req.id}
                            onClick={() => handleRequest(req.id, "accepted")}
                          >
                            <CheckCircle size={14} />
                            {processingRequest === req.id ? "..." : "Accept"}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={processingRequest === req.id}
                            onClick={() => handleRequest(req.id, "rejected")}
                          >
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
              {myRequests.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {myRequests.filter((req) => req.projects).map((req) => (
                    <div
                      key={req.id}
                      className="rounded-lg border border-border-default bg-bg-surface p-4"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-small text-text-heading">
                          Request to join{" "}
                          <Link
                            href={`/project/${req.projects.slug}`}
                            className="font-medium text-text-heading hover:text-accent"
                          >
                            {req.projects.name}
                          </Link>
                        </p>
                        <span className={`rounded-sm px-2 py-0.5 text-caption ${
                          req.status === "pending"
                            ? "bg-accent-muted text-accent"
                            : req.status === "accepted"
                              ? "bg-status-success/15 text-status-success"
                              : "bg-bg-elevated text-text-muted"
                        }`}>
                          {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
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
