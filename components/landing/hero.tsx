import Link from "next/link";
import { HeroQuestion } from "./hero-question";
import { Marker } from "@/components/shared/marker";

export function Hero() {
  return (
    <section className="mx-auto grid max-w-5xl gap-12 px-5 py-16 sm:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
      <div>
        <h1 className="animate-rise text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-[3.4rem]">
          Your placement prep, <Marker delay={700}>in the right order.</Marker>
        </h1>
        <p className="mt-6 max-w-lg animate-rise text-lg leading-relaxed text-muted-foreground [--rise-delay:120ms]">
          One path through aptitude, CS core, programming languages, DSA and
          company mock tests. Learn a concept, practice it, then prove it in a
          challenge.
        </p>
        <div className="mt-8 flex animate-rise flex-wrap items-center gap-4 [--rise-delay:240ms]">
          <Link
            href="/signup"
            className="rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
          >
            Start learning free
          </Link>
          <Link
            href="#how"
            className="px-2 py-3 font-medium underline underline-offset-4 hover:text-muted-foreground"
          >
            See how it works
          </Link>
        </div>
        <p className="mt-4 animate-rise text-sm text-muted-foreground [--rise-delay:320ms]">
          Free includes the first 2 lessons of every track and one mock test.
          No payment details to start.
        </p>
      </div>

      <div className="animate-rise [--rise-delay:360ms]">
        <HeroQuestion />
      </div>
    </section>
  );
}