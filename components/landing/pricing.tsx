import Link from "next/link";
import { Check } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { TrackStrip } from "./track-strip";

const free = [
  "The first 2 lessons of every subject, language and path",
  "Practice questions with explanations on those lessons",
  "1 of the 5 company mock tests",
  "XP, streaks and your progress dashboard",
];

const premium = [
  "Every lesson in all five areas",
  "All 5 company mock tests, plus new ones as they are added",
  "The full practice question banks",
  "Progress and review tools for the whole path",
];

const plans = [
  { id: "3m", name: "3 months", price: "₹199", per: "about ₹66 a month" },
  { id: "1y", name: "1 year", price: "₹599", per: "about ₹50 a month" },
];

export function Pricing() {
  return (
    <section
      id="pricing"
      className="scroll-mt-4 border-t border-border bg-card"
    >
      <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <Reveal>
          <h2 className="max-w-xl text-3xl font-semibold leading-tight">
            Free to start. Pay once for the full path.
          </h2>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Try the lessons on a free account first, or join Premium straight
            away. Both start the same way: you create an account.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
          {/* Free */}
          <Reveal delay={100} className="h-full">
            <div className="flex h-full flex-col rounded-xl border border-border bg-background p-7">
              <h3 className="font-heading text-2xl font-semibold">Free</h3>
              <p className="mt-3 flex items-baseline gap-2">
                <span className="text-5xl font-semibold">₹0</span>
                <span className="text-sm text-muted-foreground">
                  no payment details needed
                </span>
              </p>

              <div className="mt-6">
                <TrackStrip open={2} />
                <p className="mt-2 text-sm text-muted-foreground">
                  2 lessons open in every track
                </p>
              </div>

              <ul className="mt-6 flex-1">
                {free.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 border-t border-border py-3 text-sm"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    {item}
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="mt-6 block rounded-md border border-foreground px-6 py-3 text-center font-medium transition-colors hover:bg-secondary active:scale-[0.98]"
              >
                Start free
              </Link>
            </div>
          </Reveal>

          {/* Premium */}
          <Reveal delay={200} className="h-full">
            <div className="flex h-full flex-col rounded-xl bg-primary p-7 text-primary-foreground shadow-md">
              <h3 className="font-heading text-2xl font-semibold">Premium</h3>
              <p className="mt-3 text-sm text-primary-foreground/70">
                Everything in Free, plus the whole path. Choose how long you
                want access.
              </p>

              <div className="mt-6">
                <TrackStrip open={8} onDark />
                <p className="mt-2 text-sm text-primary-foreground/70">
                  Every lesson open in every track
                </p>
              </div>

              <ul className="mt-6">
                {premium.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 border-t border-primary-foreground/15 py-3 text-sm"
                  >
                    <Check className="mt-0.5 size-4 shrink-0 text-highlighter" />
                    {item}
                  </li>
                ))}
              </ul>

              <div className="mt-6 space-y-3">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary-foreground/20 p-4"
                  >
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-sm text-primary-foreground/70">
                        {plan.per}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-semibold">
                        {plan.price}
                      </span>
                      <Link
                        href={`/signup?plan=${plan.id}`}
                        aria-label={`Join Premium for ${plan.name}, ${plan.price}`}
                        className="rounded-md bg-highlighter px-4 py-2.5 font-medium text-foreground transition-[filter,transform] hover:brightness-95 active:scale-[0.98]"
                      >
                        Join Premium
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <Reveal delay={100} className="mt-8">
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
            You pay once for the plan you choose, with no automatic renewal.
            When it ends, your account returns to Free and your XP, streak and
            completed lessons stay. The total you pay is shown before you
            confirm. Cancellation and refund terms are in the{" "}
            <Link
              href="/terms#refunds"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Terms of Service
            </Link>
            .
          </p>
          <p className="mt-3 text-sm">
            Already registered?{" "}
            <Link
              href="/login"
              className="font-medium underline underline-offset-4 hover:text-muted-foreground"
            >
              Log in
            </Link>{" "}
            and go straight to your dashboard.
          </p>
        </Reveal>
      </div>
    </section>
  );
}