import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { createClient } from "@/lib/supabase/server";
import type { OnboardingValues } from "@/lib/validations/onboarding";

export default async function OnboardingPage({ searchParams }: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding");

  const [{ data: profile, error: profileError }, { data: response, error: responseError }, params] = await Promise.all([
    supabase.from("profiles").select("full_name, onboarding_completed").eq("id", user.id).maybeSingle(),
    supabase.from("onboarding_responses").select("*").eq("user_id", user.id).maybeSingle(),
    searchParams,
  ]);

  if (profile?.onboarding_completed) redirect("/dashboard");
  const values: OnboardingValues = {
    fullName: profile?.full_name ?? "",
    collegeName: response?.college_name ?? "",
    degree: response?.degree ?? "",
    branch: response?.branch ?? "",
    currentYear: response?.current_year ?? null,
    graduationYear: response?.graduation_year ?? null,
    programmingExperience: response?.programming_experience ?? null,
    placementGoal: response?.placement_goal ?? null,
    dailyStudyTarget: response?.daily_study_target ?? null,
    programmingInterests: response?.programming_interests ?? [],
  };

  const dataUnavailable = profileError || responseError || !profile || !response;
  const initialStep = dataUnavailable ? 1 : response.current_step;
  const initialError = params.error === "save"
    ? "We could not update your saved position. Try continuing again."
    : dataUnavailable
      ? "We could not load your saved answers. Check your connection and refresh the page."
      : undefined;

  return <OnboardingWizard initialStep={initialStep} values={values} initialError={initialError} />;
}
