import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border-default">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2">
          <span className="text-small font-bold text-text-heading">clanka</span>
          <span className="text-small text-accent">.chat</span>
          <span className="text-caption text-text-muted">
            &copy; {new Date().getFullYear()}
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/about"
            className="text-caption text-text-muted transition-colors duration-150 hover:text-text-secondary"
          >
            About
          </Link>
          <Link
            href="/terms"
            className="text-caption text-text-muted transition-colors duration-150 hover:text-text-secondary"
          >
            Terms
          </Link>
          <Link
            href="/privacy"
            className="text-caption text-text-muted transition-colors duration-150 hover:text-text-secondary"
          >
            Privacy
          </Link>
        </div>
      </div>
    </footer>
  );
}
