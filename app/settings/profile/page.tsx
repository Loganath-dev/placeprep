import Link from "next/link";
import { redirect } from "next/navigation";
import { ProfileForm } from "@/components/onboarding/profile-form";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingValues } from "@/lib/validations/onboarding";

export default async function ProfileSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings/profile");

  const [{ data: profile }, { data: response }] = await Promise.all([
    supabase.from("profiles").select("full_name, onboarding_completed").eq("id", user.id).maybeSingle(),
    supabase.from("onboarding_responses").select("*").eq("user_id", user.id).maybeSingle(),
  ]);
  if (!profile?.onboarding_completed || !response) redirect("/onboarding");

  const values: OnboardingValues = {
    fullName: profile.full_name,
    collegeName: response.college_name ?? "",
    degree: response.degree ?? "",
    branch: response.branch ?? "",
    currentYear: response.current_year,
    graduationYear: response.graduation_year,
    programmingExperience: response.programming_experience,
    placementGoal: response.placement_goal,
    dailyStudyTarget: response.daily_study_target,
    programmingInterests: response.programming_interests,
  };

  return <main className="mx-auto w-full max-w-4xl flex-1 px-5 py-10 sm:py-16">
    <Link href="/dashboard" className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground">Back to dashboard</Link>
    <header className="mt-8 max-w-2xl">
      <h1 className="text-3xl font-semibold">Profile settings</h1>
      <p className="mt-3 text-base leading-7 text-muted-foreground">Keep your academic details and learning preferences up to date.</p>
    </header>
    <div className="mt-8"><ProfileForm values={values} /></div>
  </main>;
}
