"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/Button";
import { Github, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function LoginContent() {
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("error") === "auth") {
      setError("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  async function handleSignIn() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <>
      <Nav />
      <main className="mx-auto flex max-w-sm flex-col items-center px-4 py-24 text-center">
        <h1 className="text-h1 font-bold text-text-heading">Welcome back</h1>
        <p className="mt-2 text-body text-text-secondary">
          Sign in to clanka.chat to manage your projects, teams, and revenue.
        </p>

        {error && (
          <div className="mt-6 flex w-full items-center gap-2 rounded-md border border-status-error/30 bg-status-error/10 px-4 py-3 text-small text-status-error">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        <div className="mt-8 w-full">
          <Button
            size="lg"
            onClick={handleSignIn}
            disabled={loading}
            className="w-full justify-center"
          >
            <Github size={18} />
            {loading ? "Redirecting..." : "Sign in with GitHub"}
          </Button>
        </div>

        <p className="mt-6 text-caption text-text-muted">
          Don&apos;t have an account? Signing in will create one automatically.
        </p>
      </main>
      <Footer />
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginContent />
    </Suspense>
  );
}
