"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";

type StepId = "learn" | "practice" | "challenge";

const steps: { id: StepId; name: string; text: string }[] = [
  {
    id: "learn",
    name: "Learn",
    text: "A short lesson explains one concept and works through an example, so you see the method used before you try it.",
  },
  {
    id: "practice",
    name: "Practice",
    text: "Questions on that concept follow straight away. Every question has a worked explanation, right or wrong.",
  },
  {
    id: "challenge",
    name: "Challenge",
    text: "A unit challenge checks that the whole topic has stuck. Passing it earns XP.",
  },
];

function LearnScreen() {
  return (
    <div>
      <p className="text-sm text-muted-foreground">Time and Work, lesson 1</p>
      <h3 className="mt-1 text-xl font-semibold">Work done in one day</h3>
      <p className="mt-4 leading-relaxed">
        If someone finishes a job in 12 days, they do 1/12 of the job each day.
      </p>
      <div className="mt-4 rounded-lg border border-border bg-card p-4 text-sm">
        <p className="font-medium">Worked example</p>
        <p className="mt-1 leading-relaxed text-muted-foreground">
          A takes 12 days and B takes 6 days. In one day, together they do 1/12
          + 1/6 = 1/4 of the job. So the whole job takes 4 days.
        </p>
      </div>
    </div>
  );
}

function PracticeScreen() {
  return (
    <div>
      <p className="text-sm text-muted-foreground">Python, output prediction</p>
      <h3 className="mt-1 text-xl font-semibold">What does this print?</h3>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-primary p-4 font-mono text-sm leading-relaxed text-primary-foreground">
        {`nums = [1, 2, 3]
total = 0
for n in nums:
    total += n * 2
print(total)`}
      </pre>
      <ul className="mt-4 grid grid-cols-2 gap-3 text-sm">
        {["6", "12", "14", "2"].map((option) => {
          const right = option === "12";
          return (
            <li
              key={option}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 font-medium ${
                right ? "border-pass bg-pass/10" : "border-border bg-card"
              }`}
            >
              {option}
              {right && <Check className="size-4 text-pass" />}
            </li>
          );
        })}
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Each number is doubled and added: 2 + 4 + 6 = 12.
      </p>
    </div>
  );
}

function ChallengeScreen() {
  const [filled, setFilled] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setFilled(true), 80);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Unit challenge, Percentages
      </p>
      <h3 className="mt-1 text-xl font-semibold">8 of 10 correct</h3>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-pass transition-[width] duration-700 ease-out"
          style={{ width: filled ? "80%" : "0%" }}
        />
      </div>
      <ul className="mt-5 space-y-3 text-sm">
        <li className="flex gap-2">
          <Check className="mt-0.5 size-4 shrink-0 text-pass" />
          Unit complete, +25 XP
        </li>
        <li className="flex gap-2">
          <Check className="mt-0.5 size-4 shrink-0 text-pass" />
          Your result is saved to your progress
        </li>
      </ul>
    </div>
  );
}

const screens: Record<StepId, ReactNode> = {
  learn: <LearnScreen />,
  practice: <PracticeScreen />,
  challenge: <ChallengeScreen />,
};

export function HowItWorks() {
  const [active, setActive] = useState<StepId>("learn");

  return (
    <section id="how" className="scroll-mt-4 border-t border-border">
      <div className="mx-auto max-w-5xl px-5 py-16 sm:py-20">
        <Reveal>
          <h2 className="max-w-xl text-3xl font-semibold leading-tight">
            How every lesson works
          </h2>
          <p className="mt-3 max-w-lg text-muted-foreground">
            Three parts, always in the same order. The screens here are
            examples.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <Reveal delay={100}>
            <div role="tablist" aria-label="Lesson stages">
              {steps.map((step, index) => {
                const on = active === step.id;
                return (
                  <button
                    key={step.id}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    onClick={() => setActive(step.id)}
                    className={`block w-full border-t border-border py-5 text-left transition-colors ${
                      on ? "" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="font-heading text-sm">{index + 1}</span>
                      <span
                        className={`font-heading text-xl font-semibold ${
                          on ? "highlight text-foreground" : ""
                        }`}
                      >
                        {step.name}
                      </span>
                    </span>
                    <span
                      className={`grid transition-[grid-template-rows,opacity] duration-300 ${
                        on
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <span className="overflow-hidden">
                        <span className="block pl-6 pt-2 leading-relaxed text-muted-foreground">
                          {step.text}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Reveal>

          <Reveal delay={200}>
            <div
              role="tabpanel"
              className="min-h-[22rem] rounded-xl border border-border bg-background p-6 shadow-sm"
            >
              <div key={active} className="animate-pop">
                {screens[active]}
              </div>
              <p className="mt-6 border-t border-border pt-3 text-xs text-muted-foreground">
                Example screen
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}