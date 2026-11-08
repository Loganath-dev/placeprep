"use client";

import { useActionState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { goBackOnboardingStep, saveOnboardingStep } from "@/app/actions/onboarding";
import type { OnboardingValues } from "@/lib/validations/onboarding";

const options = {
  experience: [
    ["beginner", "Beginner", "I’m starting with the fundamentals."],
    ["intermediate", "Intermediate", "I know the basics and want to build further."],
    ["advanced", "Advanced", "I’m comfortable with programming concepts."],
  ],
  goal: [
    ["service", "Service-based", "Prepare for service company assessments."],
    ["product", "Product-based", "Prepare for product company roles."],
    ["both", "Both", "Keep both kinds of opportunities open."],
    ["undecided", "I’m not sure yet", "I’ll decide as I learn more."],
  ],
  interests: [
    ["c", "C"], ["cpp", "C++"], ["java", "Java"], ["python", "Python"],
    ["javascript", "JavaScript"], ["sql", "SQL"], ["csharp", "C#"],
    ["aptitude", "Aptitude"], ["cs_core", "CS Core"], ["dsa", "Data structures and algorithms"],
  ],
} as const;

const stepTitles = [
  "What should we call you?",
  "Where do you study?",
  "What are you studying?",
  "How much have you coded?",
  "What roles interest you?",
  "How much time can you study?",
  "What would you like to learn?",
];

function TextInput({ label, name, defaultValue, type = "text", min, max }: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  min?: number;
  max?: number;
}) {
  return (
    <label htmlFor={name} className="block space-y-2 text-sm font-medium">
      {label}
      <input id={name} name={name} type={type} min={min} max={max} defaultValue={defaultValue ?? ""} required className="h-12 w-full rounded-md border border-input bg-card px-3 text-base font-normal outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" />
    </label>
  );
}

function ChoiceList({ name, items, defaultValue, columns = 1 }: {
  name: string;
  items: readonly (readonly [string, string, string?])[];
  defaultValue?: string | null;
  columns?: 1 | 2;
}) {
  return (
    <div className={`grid gap-2 ${columns === 2 ? "sm:grid-cols-2" : "grid-cols-1"}`}>
      {items.map(([value, title, description]) => (
        <label key={value} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-md border border-border bg-card px-3 py-3 text-sm transition-colors hover:bg-muted has-checked:border-foreground has-checked:bg-muted">
          <input type="radio" name={name} value={value} defaultChecked={defaultValue === value} required className="mt-0.5 accent-primary" />
          <span><span className="block font-medium">{title}</span>{description && <span className="mt-1 block leading-5 text-muted-foreground">{description}</span>}</span>
        </label>
      ))}
    </div>
  );
}

export function OnboardingWizard({ initialStep, values, initialError }: { initialStep: number; values: OnboardingValues; initialError?: string }) {
  const [state, action, pending] = useActionState(saveOnboardingStep, { step: initialStep });
  const step = state?.step ?? initialStep;
  const progress = Math.round((step / 7) * 100);

  return (
    <main className="flex flex-1 items-center justify-center px-5 py-12 sm:py-20">
      <section className="w-full max-w-2xl">
        <div className="mb-10 flex items-center justify-between gap-6">
          <Link href="/" className="font-heading text-lg font-semibold tracking-tight">StudyBench</Link>
          <div className="w-36" role="progressbar" aria-label="Onboarding progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
            <div className="h-1.5 overflow-hidden rounded-sm bg-muted"><div className="h-full bg-primary transition-[width]" style={{ width: `${progress}%` }} /></div>
          </div>
        </div>

        <div data-ui="onboarding-question" className="rounded-lg border border-border bg-card p-6 sm:p-10">
          <h1 className="max-w-xl text-3xl font-semibold leading-tight text-balance sm:text-4xl">{stepTitles[step - 1] ?? stepTitles[0]}</h1>
          <p className="mt-3 text-base leading-7 text-muted-foreground">A few answers help us put the right learning path in front of you.</p>

          <form action={action} className="mt-8 space-y-6">
            {initialError && <p role="alert" className="rounded-md bg-destructive/5 px-3 py-2.5 text-sm text-destructive">{initialError}</p>}
            {state?.error && <p role="alert" className="rounded-md bg-destructive/5 px-3 py-2.5 text-sm text-destructive">{state.error}</p>}

            {step === 1 && <TextInput label="Full name" name="fullName" defaultValue={values.fullName} />}
            {step === 2 && <TextInput label="College or university" name="collegeName" defaultValue={values.collegeName} />}
            {step === 3 && <div className="grid gap-5 sm:grid-cols-2">
              <TextInput label="Degree" name="degree" defaultValue={values.degree} />
              <TextInput label="Branch or field of study" name="branch" defaultValue={values.branch} />
              <TextInput label="Current year of study" name="currentYear" type="number" min={1} max={8} defaultValue={values.currentYear} />
              <TextInput label="Expected graduation year" name="graduationYear" type="number" min={2000} max={2100} defaultValue={values.graduationYear} />
            </div>}
            {step === 4 && <ChoiceList name="programmingExperience" items={options.experience} defaultValue={values.programmingExperience} />}
            {step === 5 && <ChoiceList name="placementGoal" items={options.goal} defaultValue={values.placementGoal} columns={2} />}
            {step === 6 && <ChoiceList name="dailyStudyTarget" items={[
              ["15", "15 minutes"], ["30", "30 minutes"], ["45", "45 minutes"], ["60", "60 minutes"], ["90", "90 minutes"],
            ]} defaultValue={values.dailyStudyTarget?.toString()} columns={2} />}
            {step === 7 && <fieldset>
              <legend className="mb-3 text-sm font-medium">Choose any that interest you. This question is optional.</legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {options.interests.map(([value, title]) => (
                  <label key={value} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-md border border-border bg-card px-3 py-3 text-sm transition-colors hover:bg-muted has-checked:border-foreground has-checked:bg-muted">
                    <input type="checkbox" name="programmingInterests" value={value} defaultChecked={values.programmingInterests.includes(value)} className="size-4 accent-primary" />
                    <span>{title}</span>
                  </label>
                ))}
              </div>
            </fieldset>}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              {step > 1 ? <button formAction={goBackOnboardingStep} className="inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><ArrowLeft size={16} />Back</button> : <span />}
              <div className="ml-auto flex items-center gap-3">
                {step === 7 && <button name="skipInterests" value="true" disabled={pending} className="h-11 rounded-md px-3 text-sm text-muted-foreground underline underline-offset-4">Skip</button>}
                <button disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] disabled:cursor-wait disabled:opacity-60">
                  {pending ? "Saving…" : step === 7 ? "Finish" : "Continue"}
                  {!pending && <ArrowRight size={16} />}
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
