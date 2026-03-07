"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { useUser } from "@/components/useUser";

const STAGE_OPTIONS = [
  { value: "idea", label: "Idea", desc: "Just a concept, looking for someone to build with" },
  { value: "needs-help", label: "Needs help", desc: "Started building but stuck on something" },
  { value: "building", label: "Building", desc: "Actively building, need a co-builder to ship faster" },
  { value: "launched", label: "Launched", desc: "Live product, looking for help growing or maintaining" },
];

const TIME_OPTIONS = [
  "< 5 hrs/week",
  "5-10 hrs/week",
  "10-15 hrs/week",
  "15-20 hrs/week",
  "20+ hrs/week",
];

export default function NewProjectPage() {
  const router = useRouter();
  const { user, loading: userLoading, unreadMessages } = useUser({ redirectTo: "/login" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lookingFor, setLookingFor] = useState("");
  const [stage, setStage] = useState("idea");
  const [techStackInput, setTechStackInput] = useState("");
  const [techStack, setTechStack] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [businessModel, setBusinessModel] = useState("");
  const [timeCommitment, setTimeCommitment] = useState("");
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );

  function addTechStack() {
    const val = techStackInput.trim();
    if (val && !techStack.includes(val)) {
      setTechStack([...techStack, val]);
      setTechStackInput("");
    }
  }

  function addTag() {
    const val = tagsInput.trim().toLowerCase();
    if (val && !tags.includes(val) && tags.length < 5) {
      setTags([...tags, val]);
      setTagsInput("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: title,
        description,
        stage,
        tech_stack: techStack,
        business_model: businessModel || null,
        time_commitment: timeCommitment || null,
        timezone: timezone || null,
        is_public: true,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/project/${data.slug}`);
    } else {
      const err = await res.json().catch(() => ({ error: "Something went wrong" }));
      setError(err.error ?? "Something went wrong");
      setSubmitting(false);
    }
  }

  return (
    <>
      <Nav user={user} loading={userLoading} unreadMessages={unreadMessages} />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="text-h1 font-bold text-text-heading">Post your project</h1>
        <p className="mt-2 text-body text-text-secondary">
          Describe what you&apos;re building and what help you need. It takes about
          2 minutes.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <fieldset className="space-y-1.5">
            <label htmlFor="title" className="text-small font-medium text-text-heading">
              Project name
            </label>
            <input
              id="title"
              type="text"
              required
              maxLength={80}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. VibeTunes"
              className="h-10 w-full rounded-md border border-border-default bg-bg-input px-3 text-small text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <p className="text-caption text-text-muted">{title.length}/80</p>
          </fieldset>

          <fieldset className="space-y-1.5">
            <label htmlFor="description" className="text-small font-medium text-text-heading">
              Description
            </label>
            <textarea
              id="description"
              required
              minLength={50}
              maxLength={500}
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you building and why? What problem does it solve?"
              className="w-full rounded-md border border-border-default bg-bg-input px-3 py-2 text-small text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <p className="text-caption text-text-muted">{description.length}/500</p>
          </fieldset>

          <fieldset className="space-y-1.5">
            <label htmlFor="looking-for" className="text-small font-medium text-text-heading">
              Looking for
            </label>
            <textarea
              id="looking-for"
              required
              rows={2}
              value={lookingFor}
              onChange={(e) => setLookingFor(e.target.value)}
              placeholder="What kind of collaborator do you need? Skills, role, or expertise."
              className="w-full rounded-md border border-border-default bg-bg-input px-3 py-2 text-small text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </fieldset>

          <fieldset className="space-y-1.5">
            <label className="text-small font-medium text-text-heading">Stage</label>
            <div className="grid gap-2 sm:grid-cols-2">
              {STAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStage(opt.value)}
                  className={`cursor-pointer rounded-md border p-3 text-left transition-colors duration-150 ${
                    stage === opt.value
                      ? "border-accent bg-accent-muted"
                      : "border-border-default bg-bg-surface hover:border-border-strong"
                  }`}
                >
                  <span className="text-small font-medium text-text-heading">
                    {opt.label}
                  </span>
                  <span className="mt-0.5 block text-caption text-text-muted">
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="space-y-1.5">
            <label htmlFor="tech-stack" className="text-small font-medium text-text-heading">
              Tech stack
            </label>
            <div className="flex gap-2">
              <input
                id="tech-stack"
                type="text"
                value={techStackInput}
                onChange={(e) => setTechStackInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTechStack();
                  }
                }}
                placeholder="e.g. Next.js, Python, Stripe"
                className="h-10 flex-1 rounded-md border border-border-default bg-bg-input px-3 text-small text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
              />
              <Button type="button" variant="secondary" size="md" onClick={addTechStack}>
                Add
              </Button>
            </div>
            {techStack.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {techStack.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-sm bg-bg-elevated px-2 py-0.5 font-mono text-caption text-text-muted"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => setTechStack(techStack.filter((x) => x !== t))}
                      className="cursor-pointer text-text-muted hover:text-text-primary"
                      aria-label={`Remove ${t}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </fieldset>

          <fieldset className="space-y-1.5">
            <label htmlFor="tags" className="text-small font-medium text-text-heading">
              Tags <span className="text-text-muted">(up to 5)</span>
            </label>
            <div className="flex gap-2">
              <input
                id="tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="e.g. ai, saas, mobile"
                disabled={tags.length >= 5}
                className="h-10 flex-1 rounded-md border border-border-default bg-bg-input px-3 text-small text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent disabled:opacity-50"
              />
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={addTag}
                disabled={tags.length >= 5}
              >
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 rounded-sm bg-accent-muted px-2 py-0.5 text-caption text-accent"
                  >
                    {t}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((x) => x !== t))}
                      className="cursor-pointer text-accent/60 hover:text-accent"
                      aria-label={`Remove ${t}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </fieldset>

          <fieldset className="space-y-1.5">
            <label htmlFor="business-model" className="text-small font-medium text-text-heading">
              Business model <span className="text-text-muted">(optional)</span>
            </label>
            <input
              id="business-model"
              type="text"
              value={businessModel}
              onChange={(e) => setBusinessModel(e.target.value)}
              placeholder="e.g. SaaS subscription, one-time purchase, ad-supported"
              className="h-10 w-full rounded-md border border-border-default bg-bg-input px-3 text-small text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </fieldset>

          <div className="grid gap-6 sm:grid-cols-2">
            <fieldset className="space-y-1.5">
              <label htmlFor="time-commitment" className="text-small font-medium text-text-heading">
                Time commitment
              </label>
              <select
                id="time-commitment"
                value={timeCommitment}
                onChange={(e) => setTimeCommitment(e.target.value)}
                className="h-10 w-full rounded-md border border-border-default bg-bg-input px-3 text-small text-text-primary focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">Select...</option>
                {TIME_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </fieldset>

            <fieldset className="space-y-1.5">
              <label htmlFor="timezone" className="text-small font-medium text-text-heading">
                Timezone
              </label>
              <input
                id="timezone"
                type="text"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="h-10 w-full rounded-md border border-border-default bg-bg-input px-3 text-small text-text-primary focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </fieldset>
          </div>

          {error && (
            <p className="text-small text-status-error">{error}</p>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="submit" size="lg" disabled={submitting || !title || description.length < 50}>
              {submitting ? "Posting..." : "Post Project"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              onClick={() => router.push("/dashboard")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
}
