"use client";

import { useState } from "react";
import { Button } from "@/components/Button";
import { Users, CheckCircle, X } from "lucide-react";

type JoinRequestButtonProps = {
  projectSlug: string;
  projectName: string;
  openRoles: string[];
  onSuccess?: () => void;
};

export function JoinRequestButton({
  projectSlug,
  projectName,
  openRoles,
  onSuccess,
}: JoinRequestButtonProps) {
  const [status, setStatus] = useState<"idle" | "form" | "submitting" | "sent">(
    "idle"
  );
  const [message, setMessage] = useState("");
  const [selectedRole, setSelectedRole] = useState(openRoles[0] ?? "");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch(`/api/projects/${projectSlug}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message || null, role: selectedRole }),
      });

      if (res.ok) {
        setStatus("sent");
        onSuccess?.();
      } else {
        const err = await res.json().catch(() => ({ error: "Something went wrong" }));
        setError(err.error ?? "Something went wrong");
        setStatus("form");
      }
    } catch {
      setError("Network error. Please try again.");
      setStatus("form");
    }
  }

  if (status === "sent") {
    return (
      <div className="flex items-center gap-2 rounded-md bg-status-success/15 px-4 py-3 text-small text-status-success">
        <CheckCircle size={16} />
        Request sent! The project creator will review your request.
      </div>
    );
  }

  if (status === "form" || status === "submitting") {
    return (
      <div className="rounded-lg border border-border-default bg-bg-surface p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-h3 font-semibold text-text-heading">
            Request to Join {projectName}
          </h3>
          <button
            type="button"
            onClick={() => setStatus("idle")}
            className="cursor-pointer rounded-md p-1 text-text-muted transition-colors duration-150 hover:text-text-primary"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <p className="mt-3 text-small text-status-error">{error}</p>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {openRoles.length > 1 && (
            <fieldset className="space-y-1.5">
              <label
                htmlFor="join-role"
                className="text-small font-medium text-text-heading"
              >
                Which role are you applying for?
              </label>
              <select
                id="join-role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="h-10 w-full rounded-md border border-border-default bg-bg-input px-3 text-small text-text-primary focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
              >
                {openRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </fieldset>
          )}

          <fieldset className="space-y-1.5">
            <label
              htmlFor="join-message"
              className="text-small font-medium text-text-heading"
            >
              Message to the creator
            </label>
            <textarea
              id="join-message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Why do you want to join? What skills and experience do you bring?"
              className="w-full rounded-md border border-border-default bg-bg-input px-3 py-2 text-small text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </fieldset>

          <div className="flex gap-3">
            <Button
              type="submit"
              size="md"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Sending..." : "Send Request"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setStatus("idle")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <Button size="lg" onClick={() => setStatus("form")}>
      <Users size={18} />
      Request to Join
    </Button>
  );
}
