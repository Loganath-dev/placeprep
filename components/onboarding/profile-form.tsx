"use client";

import { useActionState } from "react";
import { updateStudentProfile } from "@/app/actions/onboarding";
import type { OnboardingValues } from "@/lib/validations/onboarding";

const interests = [
  ["c", "C"], ["cpp", "C++"], ["java", "Java"], ["python", "Python"],
  ["javascript", "JavaScript"], ["sql", "SQL"], ["csharp", "C#"],
  ["aptitude", "Aptitude"], ["cs_core", "CS Core"], ["dsa", "Data structures and algorithms"],
] as const;

function TextField({ label, name, value, type = "text", min, max }: {
  label: string;
  name: string;
  value: string | number | null;
  type?: string;
  min?: number;
  max?: number;
}) {
  return <label htmlFor={name} className="block space-y-2 text-sm font-medium">{label}<input id={name} name={name} type={type} min={min} max={max} required defaultValue={value ?? ""} className="h-11 w-full rounded-md border border-input bg-card px-3 text-base font-normal outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30" /></label>;
}

function SelectField({ label, name, value, choices }: {
  label: string;
  name: string;
  value: string | number | null;
  choices: readonly (readonly [string, string])[];
}) {
  return <label htmlFor={name} className="block space-y-2 text-sm font-medium">{label}<select id={name} name={name} required defaultValue={value?.toString() ?? ""} className="h-11 w-full rounded-md border border-input bg-card px-3 text-base font-normal outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"><option value="" disabled>Select one</option>{choices.map(([option, title]) => <option key={option} value={option}>{title}</option>)}</select></label>;
}

export function ProfileForm({ values }: { values: OnboardingValues }) {
  const [state, action, pending] = useActionState(updateStudentProfile, undefined);
  return <form action={action} className="space-y-8">
    {state?.error && <p role="alert" className="rounded-md bg-destructive/5 px-3 py-2.5 text-sm text-destructive">{state.error}</p>}
    {state?.success && <p role="status" className="rounded-md bg-pass/5 px-3 py-2.5 text-sm text-pass">{state.success}</p>}

    <section aria-labelledby="identity-heading" className="space-y-4">
      <h2 id="identity-heading" className="text-lg font-semibold">Your details</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField label="Full name" name="fullName" value={values.fullName} />
        <TextField label="College or university" name="collegeName" value={values.collegeName} />
        <TextField label="Degree" name="degree" value={values.degree} />
        <TextField label="Branch or field of study" name="branch" value={values.branch} />
        <TextField label="Current year of study" name="currentYear" type="number" min={1} max={8} value={values.currentYear} />
        <TextField label="Expected graduation year" name="graduationYear" type="number" min={2000} max={2100} value={values.graduationYear} />
      </div>
    </section>

    <section aria-labelledby="goals-heading" className="space-y-4">
      <h2 id="goals-heading" className="text-lg font-semibold">Your study preferences</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField label="Programming experience" name="programmingExperience" value={values.programmingExperience} choices={[["beginner", "Beginner"], ["intermediate", "Intermediate"], ["advanced", "Advanced"]]} />
        <SelectField label="Placement goal" name="placementGoal" value={values.placementGoal} choices={[["service", "Service-based companies"], ["product", "Product-based companies"], ["both", "Both"], ["undecided", "Not decided"]]} />
        <SelectField label="Daily study target" name="dailyStudyTarget" value={values.dailyStudyTarget} choices={[["15", "15 minutes"], ["30", "30 minutes"], ["45", "45 minutes"], ["60", "60 minutes"], ["90", "90 minutes"]]} />
      </div>
      <fieldset>
        <legend className="mb-3 text-sm font-medium">Learning interests</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {interests.map(([value, title]) => <label key={value} className="flex min-h-11 items-center gap-3 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-muted has-checked:bg-muted"><input type="checkbox" name="programmingInterests" value={value} defaultChecked={values.programmingInterests.includes(value)} className="size-4 accent-primary" />{title}</label>)}
        </div>
      </fieldset>
    </section>

    <button disabled={pending} className="h-11 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60">{pending ? "Saving…" : "Save profile"}</button>
  </form>;
}
