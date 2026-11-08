import Link from "next/link";
import { SiteHeader } from "@/components/shared/site-header";
import { SiteFooter } from "@/components/shared/site-footer";
import { Reveal } from "@/components/shared/reveal";
import { Marker } from "@/components/shared/marker";
import { Hero } from "@/components/landing/hero";
import { Problem } from "@/components/landing/problem";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Pricing } from "@/components/landing/pricing";
import { Faq } from "@/components/landing/faq";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <Problem />
        <HowItWorks />
        <Pricing />
        <Faq />
        <section className="border-t border-border bg-card">
          <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
            <Reveal>
              <h2 className="max-w-lg text-3xl font-semibold leading-tight">
                Start with your <Marker>first lesson.</Marker>
              </h2>
              <p className="mt-3 max-w-md text-muted-foreground">
                Create a free account, answer a few questions about your goals,
                and your roadmap is ready.
              </p>
              <Link
                href="/signup"
                className="mt-6 inline-block rounded-md bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98]"
              >
                Start learning free
              </Link>
            </Reveal>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}