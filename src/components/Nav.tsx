"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type NavProps = {
  user?: {
    username: string;
    avatar_url: string;
  } | null;
};

export function Nav({ user }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-all duration-150 ${
        scrolled
          ? "border-border-default bg-bg-base/80 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-h3 font-bold text-text-heading">clanka</span>
          <span className="text-accent">.chat</span>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/explore"
            className="text-small text-text-secondary transition-colors duration-150 hover:text-text-primary"
          >
            Explore
          </Link>
          {user && (
            <Link
              href="/dashboard"
              className="text-small text-text-secondary transition-colors duration-150 hover:text-text-primary"
            >
              Dashboard
            </Link>
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <Link
              href={`/u/${user.username}`}
              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-small text-text-secondary transition-colors duration-150 hover:bg-bg-surface hover:text-text-primary"
            >
              <img
                src={user.avatar_url}
                alt={user.username}
                className="h-6 w-6 rounded-full"
              />
              <span>{user.username}</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-1.5 text-small text-text-secondary transition-colors duration-150 hover:text-text-primary"
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="rounded-md bg-accent px-4 py-1.5 text-small font-medium text-bg-base transition-colors duration-150 hover:bg-accent-hover"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="rounded-md p-2 text-text-secondary transition-colors duration-150 hover:text-text-primary md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border-default bg-bg-base/95 backdrop-blur-xl md:hidden">
          <div className="flex flex-col gap-1 px-4 py-3">
            <Link
              href="/explore"
              className="rounded-md px-3 py-2 text-small text-text-secondary transition-colors duration-150 hover:bg-bg-surface hover:text-text-primary"
              onClick={() => setMobileOpen(false)}
            >
              Explore
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="rounded-md px-3 py-2 text-small text-text-secondary transition-colors duration-150 hover:bg-bg-surface hover:text-text-primary"
                onClick={() => setMobileOpen(false)}
              >
                Dashboard
              </Link>
            )}
            <div className="my-2 border-t border-border-subtle" />
            {user ? (
              <Link
                href={`/u/${user.username}`}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-small text-text-secondary transition-colors duration-150 hover:bg-bg-surface hover:text-text-primary"
                onClick={() => setMobileOpen(false)}
              >
                <img
                  src={user.avatar_url}
                  alt={user.username}
                  className="h-6 w-6 rounded-full"
                />
                <span>{user.username}</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-md px-3 py-2 text-small text-text-secondary transition-colors duration-150 hover:text-text-primary"
                  onClick={() => setMobileOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/login"
                  className="rounded-md bg-accent px-3 py-2 text-center text-small font-medium text-bg-base transition-colors duration-150 hover:bg-accent-hover"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
