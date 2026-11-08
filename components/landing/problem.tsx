import { Check, X } from "lucide-react";
import { Reveal, RevealList } from "@/components/shared/reveal";

const today = [
  "Aptitude on one site, coding on another",
  "Mock tests scattered across a third",
  "Notes in a notebook you never reopen",
  "No clear answer to what to study next",
];

const withStudyBench = [
  "One roadmap across all five areas",
  "A recommended next lesson on your dashboard",
  "Every lesson ends with practice and explanations",
  "Progress saved to your account",
];

export function Problem() {
  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <Reveal>
          <h2 className="max-w-xl text-3xl font-semibold leading-tight">
            Placement prep usually means many tabs and no plan.
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-16">
          <div>
            <h3 className="text-lg font-semibold text-muted-foreground">
              Preparing today
            </h3>
            <RevealList
              className="mt-4"
              itemClassName="flex gap-3 border-t border-border py-4 text-muted-foreground"
              items={today.map((text) => (
                <>
                  <X className="mt-0.5 size-5 shrink-0 text-destructive" />
                  {text}
                </>
              ))}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold">With StudyBench</h3>
            <RevealList
              className="mt-4"
              delay={350}
              itemClassName="flex gap-3 border-t border-border py-4"
              items={withStudyBench.map((text) => (
                <>
                  <Check className="mt-0.5 size-5 shrink-0 text-pass" />
                  {text}
                </>
              ))}
            />
          </div>
        </div>
      </div>
    </section>
  );
}