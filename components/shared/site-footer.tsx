import Link from "next/link";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-5 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>© 2026 StudyBench</p>
        <nav className="flex flex-wrap gap-5">
          <Link href="/terms" className="hover:text-foreground">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-foreground">
            Privacy Policy
          </Link>
          <a
            href={`mailto:${site.supportEmail}`}
            className="hover:text-foreground"
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}