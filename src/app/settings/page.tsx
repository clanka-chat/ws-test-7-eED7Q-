"use client";

import { useState } from "react";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import {
  User,
  Link as LinkIcon,
  CreditCard,
  Shield,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

const MOCK_USER = {
  username: "spaghettipete",
  avatar_url: "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=spaghettipete",
};

type SettingsSection = "profile" | "accounts" | "payments" | "privacy";

const SECTIONS: { id: SettingsSection; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <User size={16} /> },
  { id: "accounts", label: "Accounts", icon: <LinkIcon size={16} /> },
  { id: "payments", label: "Payments", icon: <CreditCard size={16} /> },
  { id: "privacy", label: "Privacy", icon: <Shield size={16} /> },
];

export default function SettingsPage() {
  const [section, setSection] = useState<SettingsSection>("profile");

  const [displayName, setDisplayName] = useState("Pete");
  const [bio, setBio] = useState(
    "Full-stack vibecoder. Building clanka.chat."
  );
  const [skillsInput, setSkillsInput] = useState("");
  const [skills, setSkills] = useState<string[]>([
    "TypeScript",
    "Next.js",
    "Supabase",
    "Product Design",
  ]);
  const [avatarUrl, setAvatarUrl] = useState(MOCK_USER.avatar_url);

  const [githubUsername, setGithubUsername] = useState("spaghettipete");
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(true);

  const [privacyRevenue, setPrivacyRevenue] = useState(false);
  const [privacyProjects, setPrivacyProjects] = useState(false);
  const [privacyActivity, setPrivacyActivity] = useState(false);

  const [saving, setSaving] = useState(false);

  function addSkill() {
    const val = skillsInput.trim();
    if (val && !skills.includes(val)) {
      setSkills([...skills, val]);
      setSkillsInput("");
    }
  }

  function generateApiKey() {
    const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
    let key = "clk_";
    for (let i = 0; i < 32; i++) {
      key += chars[Math.floor(Math.random() * chars.length)];
    }
    setApiKey(key);
    setApiKeyVisible(true);
  }

  function copyApiKey() {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey);
      setApiKeyCopied(true);
      setTimeout(() => setApiKeyCopied(false), 2000);
    }
  }

  async function handleSave() {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 500));
    setSaving(false);
  }

  return (
    <>
      <Nav user={MOCK_USER} />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="text-h1 font-bold text-text-heading">Settings</h1>
        <p className="mt-1 text-body text-text-secondary">
          Manage your profile, connected accounts, and preferences.
        </p>

        <div className="mt-8 flex flex-col gap-8 md:flex-row">
          <nav className="flex gap-1 md:w-48 md:shrink-0 md:flex-col">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSection(s.id)}
                className={`flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-small transition-colors duration-150 ${
                  section === s.id
                    ? "bg-bg-elevated text-text-heading"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </nav>

          <div className="flex-1">
            {section === "profile" && (
              <div className="space-y-6">
                <h2 className="text-h3 font-semibold text-text-heading">
                  Profile
                </h2>

                <div className="flex items-center gap-4">
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="h-16 w-16 rounded-full border border-border-default bg-bg-elevated"
                  />
                  <div>
                    <p className="text-small text-text-secondary">
                      Avatar is pulled from your GitHub account.
                    </p>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="Avatar URL"
                      className="mt-1 h-9 w-full rounded-md border border-border-default bg-bg-input px-3 text-caption text-text-primary focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                  </div>
                </div>

                <fieldset className="space-y-1.5">
                  <label htmlFor="display-name" className="text-small font-medium text-text-heading">
                    Display name
                  </label>
                  <input
                    id="display-name"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="h-10 w-full rounded-md border border-border-default bg-bg-input px-3 text-small text-text-primary focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </fieldset>

                <fieldset className="space-y-1.5">
                  <label htmlFor="bio" className="text-small font-medium text-text-heading">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    rows={3}
                    maxLength={300}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-md border border-border-default bg-bg-input px-3 py-2 text-small text-text-primary focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                  <p className="text-caption text-text-muted">
                    {bio.length}/300
                  </p>
                </fieldset>

                <fieldset className="space-y-1.5">
                  <label htmlFor="skills" className="text-small font-medium text-text-heading">
                    Skills
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="skills"
                      type="text"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="e.g. React, Python, Marketing"
                      className="h-10 flex-1 rounded-md border border-border-default bg-bg-input px-3 text-small text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      size="md"
                      onClick={addSkill}
                    >
                      Add
                    </Button>
                  </div>
                  {skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((s) => (
                        <span
                          key={s}
                          className="inline-flex items-center gap-1 rounded-sm bg-bg-elevated px-2 py-0.5 font-mono text-caption text-text-muted"
                        >
                          {s}
                          <button
                            type="button"
                            onClick={() =>
                              setSkills(skills.filter((x) => x !== s))
                            }
                            className="cursor-pointer text-text-muted hover:text-text-primary"
                            aria-label={`Remove ${s}`}
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </fieldset>

                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </div>
            )}

            {section === "accounts" && (
              <div className="space-y-6">
                <h2 className="text-h3 font-semibold text-text-heading">
                  Connected Accounts
                </h2>

                <fieldset className="space-y-1.5">
                  <label htmlFor="github-username" className="text-small font-medium text-text-heading">
                    GitHub Username
                  </label>
                  <p className="text-caption text-text-muted">
                    Your GitHub username. Required if you&apos;ll have code access
                    to projects.
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      id="github-username"
                      type="text"
                      value={githubUsername}
                      onChange={(e) => setGithubUsername(e.target.value)}
                      placeholder="your-github-username"
                      className="h-10 flex-1 rounded-md border border-border-default bg-bg-input px-3 text-small text-text-primary placeholder:text-text-muted focus:border-border-strong focus:outline-none focus:ring-1 focus:ring-accent"
                    />
                    {githubUsername ? (
                      <span className="flex items-center gap-1 text-caption text-status-success">
                        <CheckCircle size={14} />
                        Set
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-caption text-status-warning">
                        <AlertTriangle size={14} />
                        Required
                      </span>
                    )}
                  </div>
                </fieldset>

                <div className="border-t border-border-subtle pt-6">
                  <h3 className="text-small font-medium text-text-heading">
                    MCP API Key
                  </h3>
                  <p className="mt-1 text-caption text-text-muted">
                    Use this key to authenticate the clanka MCP server with your
                    AI tools (Claude Code, Cursor, Windsurf).
                  </p>

                  {apiKey ? (
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <code className="flex-1 rounded-md border border-border-default bg-bg-elevated px-3 py-2 font-mono text-small text-text-primary">
                          {apiKeyVisible
                            ? apiKey
                            : "clk_" + "•".repeat(32)}
                        </code>
                        <button
                          type="button"
                          onClick={() => setApiKeyVisible(!apiKeyVisible)}
                          className="cursor-pointer rounded-md p-2 text-text-muted transition-colors duration-150 hover:text-text-primary"
                          aria-label={apiKeyVisible ? "Hide key" : "Show key"}
                        >
                          {apiKeyVisible ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={copyApiKey}
                          className="cursor-pointer rounded-md p-2 text-text-muted transition-colors duration-150 hover:text-text-primary"
                          aria-label="Copy key"
                        >
                          {apiKeyCopied ? (
                            <CheckCircle size={16} className="text-status-success" />
                          ) : (
                            <Copy size={16} />
                          )}
                        </button>
                      </div>
                      <div className="mt-3">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            if (
                              window.confirm(
                                "Regenerate your API key? The old key will stop working immediately."
                              )
                            ) {
                              generateApiKey();
                            }
                          }}
                        >
                          <RefreshCw size={14} />
                          Regenerate Key
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <Button variant="secondary" size="md" onClick={generateApiKey}>
                        Generate API Key
                      </Button>
                    </div>
                  )}
                </div>

                <div className="border-t border-border-subtle pt-6">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? "Saving..." : "Save Accounts"}
                  </Button>
                </div>
              </div>
            )}

            {section === "payments" && (
              <div className="space-y-6">
                <h2 className="text-h3 font-semibold text-text-heading">
                  Payments
                </h2>

                <div className="rounded-lg border border-border-default bg-bg-surface p-6">
                  <h3 className="text-small font-medium text-text-heading">
                    Stripe Connect
                  </h3>
                  <p className="mt-1 text-caption text-text-muted">
                    Connect your Stripe account to receive revenue payouts from
                    your projects.
                  </p>
                  <div className="mt-4">
                    {stripeConnected ? (
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1.5 rounded-sm bg-status-success/15 px-3 py-1.5 text-small text-status-success">
                          <CheckCircle size={14} />
                          Stripe Connected
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setStripeConnected(false)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => setStripeConnected(true)}
                      >
                        <CreditCard size={16} />
                        Connect Stripe
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {section === "privacy" && (
              <div className="space-y-6">
                <h2 className="text-h3 font-semibold text-text-heading">
                  Privacy
                </h2>

                <div className="space-y-4">
                  <label className="flex items-center justify-between rounded-lg border border-border-default bg-bg-surface p-4">
                    <div>
                      <p className="text-small font-medium text-text-heading">
                        Hide revenue from profile
                      </p>
                      <p className="mt-0.5 text-caption text-text-muted">
                        Other users won&apos;t see your earnings.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyRevenue}
                      onChange={(e) => setPrivacyRevenue(e.target.checked)}
                      className="h-5 w-5 cursor-pointer rounded border-border-default accent-accent"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-lg border border-border-default bg-bg-surface p-4">
                    <div>
                      <p className="text-small font-medium text-text-heading">
                        Hide projects from profile
                      </p>
                      <p className="mt-0.5 text-caption text-text-muted">
                        Your projects won&apos;t appear on your public profile.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyProjects}
                      onChange={(e) => setPrivacyProjects(e.target.checked)}
                      className="h-5 w-5 cursor-pointer rounded border-border-default accent-accent"
                    />
                  </label>

                  <label className="flex items-center justify-between rounded-lg border border-border-default bg-bg-surface p-4">
                    <div>
                      <p className="text-small font-medium text-text-heading">
                        Hide activity from profile
                      </p>
                      <p className="mt-0.5 text-caption text-text-muted">
                        Your contribution activity will be private.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={privacyActivity}
                      onChange={(e) => setPrivacyActivity(e.target.checked)}
                      className="h-5 w-5 cursor-pointer rounded border-border-default accent-accent"
                    />
                  </label>
                </div>

                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Privacy"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
