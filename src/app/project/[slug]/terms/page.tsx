"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { useUser } from "@/components/useUser";
import { Loader2, CheckCircle } from "lucide-react";
import type { WorkspaceTerm } from "../../../../../types/database";

const PLATFORM_FEE_PCT = 5;
const TEAM_TOTAL = 100 - PLATFORM_FEE_PCT;

const splitBarColors = [
  "bg-accent",
  "bg-status-info",
  "bg-status-success",
  "bg-purple-500",
  "bg-pink-500",
];

type TeamMember = {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
};

type TermsResponse = {
  terms: WorkspaceTerm | null;
  team: TeamMember[];
};

export default function TermsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { user, userId, loading: userLoading, unreadMessages } = useUser({
    redirectTo: "/login",
  });
  const [terms, setTerms] = useState<WorkspaceTerm | null>(null);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [splits, setSplits] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/workspace/${slug}/terms`);
        if (res.ok) {
          const data: TermsResponse = await res.json();
          setTerms(data.terms);
          const fetchedTeam = data.team ?? [];
          setTeam(fetchedTeam);

          if (!data.terms && fetchedTeam.length > 0) {
            const equal = Math.floor(TEAM_TOTAL / fetchedTeam.length);
            const remainder = TEAM_TOTAL - equal * fetchedTeam.length;
            const initial: Record<string, number> = {};
            fetchedTeam.forEach((m, i) => {
              initial[m.id] = equal + (i === 0 ? remainder : 0);
            });
            setSplits(initial);
          }
        }
      } catch {
        setError("Failed to load terms. Please try again.");
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  const total = Object.values(splits).reduce((sum, v) => sum + v, 0);

  function updateSplit(memberId: string, value: string) {
    const num = value === "" ? 0 : parseInt(value, 10);
    if (isNaN(num) || num < 0 || num > TEAM_TOTAL) return;
    setSplits((prev) => ({ ...prev, [memberId]: num }));
  }

  async function handlePropose(e: React.FormEvent) {
    e.preventDefault();
    if (total !== TEAM_TOTAL) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/workspace/${slug}/terms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ splits }),
      });

      if (res.ok) {
        const data: { terms: WorkspaceTerm } = await res.json();
        setTerms(data.terms);
      } else {
        const err: { error?: string } = await res.json().catch(() => ({ error: "Something went wrong" }));
        setError(err.error ?? "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setSubmitting(false);
  }

  async function handleAccept() {
    if (!userId || !terms) return;
    setAccepting(true);
    setError(null);

    try {
      const res = await fetch(`/api/workspace/${slug}/terms/${terms.id}/accept`, {
        method: "PATCH",
      });

      if (res.ok) {
        setTerms((prev) =>
          prev
            ? { ...prev, accepted_by: [...prev.accepted_by, userId] }
            : prev
        );
      } else {
        const err: { error?: string } = await res.json().catch(() => ({ error: "Something went wrong" }));
        setError(err.error ?? "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setAccepting(false);
  }

  if (loading) {
    return (
      <>
        <Nav user={user} loading={userLoading} unreadMessages={unreadMessages} />
        <main className="mx-auto flex max-w-2xl items-center justify-center px-4 py-24">
          <Loader2 size={24} className="animate-spin text-text-muted" />
        </main>
        <Footer />
      </>
    );
  }

  const termsSplits: Record<string, number> | undefined =
    terms?.splits && typeof terms.splits === "object" && !Array.isArray(terms.splits)
      ? (terms.splits as Record<string, number>)
      : undefined;
  const allAccepted = terms && team.length > 0 && team.every((m) => terms.accepted_by.includes(m.id));
  const userAccepted = terms && userId ? terms.accepted_by.includes(userId) : false;

  return (
    <>
      <Nav user={user} loading={userLoading} unreadMessages={unreadMessages} />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <Link
          href={`/project/${slug}`}
          className="text-small text-text-muted hover:text-text-primary"
        >
          &larr; Back to project
        </Link>

        <h1 className="mt-4 text-h1 font-bold text-text-heading">
          Revenue Terms
        </h1>

        {error && (
          <p className="mt-4 text-small text-status-error">{error}</p>
        )}

        {/* All accepted — success state */}
        {allAccepted && termsSplits && (
          <div className="mt-8">
            <div className="flex items-center gap-2 rounded-md bg-status-success/15 px-4 py-3 text-small text-status-success">
              <CheckCircle size={16} />
              Terms agreed! Workspace will be created.
            </div>

            <div className="mt-6">
              <SplitBar splits={termsSplits} team={team} />
              <SplitList splits={termsSplits} team={team} acceptedBy={terms.accepted_by} />
            </div>
          </div>
        )}

        {/* Terms proposed but not all accepted */}
        {terms && !allAccepted && termsSplits && (
          <div className="mt-8">
            <p className="text-body text-text-secondary">
              Revenue split has been proposed. All team members must accept.
            </p>

            <div className="mt-6">
              <SplitBar splits={termsSplits} team={team} />
              <SplitList splits={termsSplits} team={team} acceptedBy={terms.accepted_by} />
            </div>

            {userId && !userAccepted && (
              <div className="mt-6">
                <Button
                  size="lg"
                  disabled={accepting}
                  onClick={handleAccept}
                >
                  {accepting ? "Accepting..." : "Accept Terms"}
                </Button>
              </div>
            )}

            {userAccepted && (
              <p className="mt-6 text-small text-status-success">
                You&apos;ve accepted — waiting for others
              </p>
            )}
          </div>
        )}

        {/* No terms — propose form (only visible to team members) */}
        {!terms && team.length > 0 && (
          <div className="mt-8">
            <p className="text-body text-text-secondary">
              Propose how revenue will be split among the team.
            </p>

            {team.length > 0 && total > 0 && (
              <div className="mt-6">
                <SplitBar splits={splits} team={team} />
              </div>
            )}

            <form onSubmit={handlePropose} className="mt-6 space-y-4">
              {team.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between rounded-md border border-border-subtle bg-bg-surface px-4 py-3"
                >
                  <div>
                    <p className="text-small font-medium text-text-heading">
                      {member.display_name ?? member.username}
                    </p>
                    {member.display_name && (
                      <p className="text-caption text-text-muted">
                        @{member.username}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={TEAM_TOTAL}
                      value={splits[member.id] ?? 0}
                      onChange={(e) => updateSplit(member.id, e.target.value)}
                      className="h-10 w-20 rounded-md border border-border-default bg-bg-input px-3 text-right font-mono text-small text-text-primary focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <span className="text-small text-text-muted">%</span>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-between rounded-md bg-bg-elevated px-4 py-3">
                <span className="text-small font-medium text-text-heading">Team Total</span>
                <span
                  className={`font-mono text-small font-bold ${
                    total === TEAM_TOTAL
                      ? "text-status-success"
                      : "text-status-error"
                  }`}
                >
                  {total}% / {TEAM_TOTAL}%
                </span>
              </div>

              <p className="text-caption text-accent">
                {PLATFORM_FEE_PCT}% platform fee is automatically reserved
              </p>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting || total !== TEAM_TOTAL}
                >
                  {submitting ? "Proposing..." : "Propose Terms"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="lg"
                  onClick={() => history.back()}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {!terms && team.length === 0 && !loading && (
          <p className="mt-8 text-body text-text-secondary">
            No team members yet. Accept collaborators before proposing terms.
          </p>
        )}
      </main>
      <Footer />
    </>
  );
}

function SplitBar({
  splits,
  team,
}: {
  splits: Record<string, number>;
  team: TeamMember[];
}) {
  return (
    <div>
      <div className="flex h-3 overflow-hidden rounded-full bg-bg-elevated">
        {team.map((member, i) => {
          const pct = splits[member.id] ?? 0;
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
  );
}

function SplitList({
  splits,
  team,
  acceptedBy,
}: {
  splits: Record<string, number>;
  team: TeamMember[];
  acceptedBy: string[];
}) {
  return (
    <div className="mt-3 space-y-2">
      {team.map((member, i) => (
        <div
          key={member.id}
          className="flex items-center justify-between rounded-md border border-border-subtle bg-bg-surface px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <span
              className={`inline-block h-3 w-3 rounded-full ${splitBarColors[i % splitBarColors.length]}`}
            />
            <p className="text-small font-medium text-text-heading">
              {member.display_name ?? member.username}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-small text-text-heading">
              {splits[member.id] ?? 0}%
            </span>
            {acceptedBy.includes(member.id) ? (
              <span className="rounded-sm bg-status-success/15 px-2 py-0.5 text-caption text-status-success">
                Accepted
              </span>
            ) : (
              <span className="rounded-sm bg-accent-muted px-2 py-0.5 text-caption text-accent">
                Pending
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
