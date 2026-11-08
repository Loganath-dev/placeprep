"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const links = [
  { href: "/#how", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function update() {
      const y = window.scrollY;
      setScrolled(y > 8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (bar.current) {
        const percent = max > 0 ? Math.min((y / max) * 100, 100) : 0;
        bar.current.style.width = `${percent}%`;
      }
    }

    const frame = requestAnimationFrame(update);
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 border-b border-border bg-background transition-shadow duration-300 ${
        scrolled ? "shadow-[0_10px_24px_-18px_rgb(27_36_55/0.35)]" : ""
      }`}
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5">
        <Link
          href="/"
          className="font-heading text-xl font-semibold tracking-tight"
        >
          StudyBench
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="link-draw hidden pb-0.5 text-muted-foreground hover:text-foreground md:block"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            className="text-muted-foreground hover:text-foreground"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-md bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
          >
            Start free
          </Link>
        </nav>
      </div>
      <div
        ref={bar}
        aria-hidden="true"
        className="absolute -bottom-px left-0 h-0.5 w-0 bg-highlighter"
      />
    </header>
  );
}