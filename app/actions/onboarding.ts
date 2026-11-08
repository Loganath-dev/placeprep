"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  academicSchema,
  collegeSchema,
  fullNameSchema,
  interestsSchema,
  placementGoalSchema,
  programmingExperienceSchema,
  studyTargetSchema,
  type OnboardingActionState,
} from "@/lib/validations/onboarding";
import { studentProfileSchema } from "@/lib/validations/profile";
import type { AuthFormState } from "@/lib/validations/auth";

function invalid(error?: string): OnboardingActionState {
  return { step: 1, error: error ?? "Check your answer and try again." };
}

export async function saveOnboardingStep(
  state: OnboardingActionState,
  formData: FormData,
): Promise<OnboardingActionState> {
  void state;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding");

  const { data: progress, error: progressError } = await supabase
    .from("onboarding_responses")
    .select("current_step, completed_at")
    .eq("user_id", user.id)
    .single();

  if (progressError || !progress) return invalid("We could not load your saved onboarding progress.");
  if (progress.completed_at) redirect("/dashboard");

  const step = progress.current_step;
  let updateError: { message: string } | null = null;

  if (step === 1) {
    const parsed = fullNameSchema.safeParse(formData.get("fullName"));
    if (!parsed.success) return { step, error: parsed.error.issues[0]?.message ?? "Enter your full name." };
    const result = await supabase.from("profiles").update({ full_name: parsed.data }).eq("id", user.id);
    updateError = result.error;
  } else if (step === 2) {
    const parsed = collegeSchema.safeParse(formData.get("collegeName"));
    if (!parsed.success) return { step, error: parsed.error.issues[0]?.message ?? "Enter your college name." };
    const result = await supabase.from("onboarding_responses").update({ college_name: parsed.data }).eq("user_id", user.id);
    updateError = result.error;
  } else if (step === 3) {
    const parsed = academicSchema.safeParse({
      degree: formData.get("degree"),
      branch: formData.get("branch"),
      currentYear: formData.get("currentYear"),
      graduationYear: formData.get("graduationYear"),
    });
    if (!parsed.success) return { step, error: parsed.error.issues[0]?.message ?? "Check your academic details." };
    const result = await supabase.from("onboarding_responses").update({
      degree: parsed.data.degree,
      branch: parsed.data.branch,
      current_year: parsed.data.currentYear,
      graduation_year: parsed.data.graduationYear,
    }).eq("user_id", user.id);
    updateError = result.error;
  } else if (step === 4) {
    const parsed = programmingExperienceSchema.safeParse(formData.get("programmingExperience"));
    if (!parsed.success) return { step, error: "Choose your current programming experience." };
    const result = await supabase.from("onboarding_responses").update({ programming_experience: parsed.data }).eq("user_id", user.id);
    updateError = result.error;
  } else if (step === 5) {
    const parsed = placementGoalSchema.safeParse(formData.get("placementGoal"));
    if (!parsed.success) return { step, error: "Choose a placement goal." };
    const result = await supabase.from("onboarding_responses").update({ placement_goal: parsed.data }).eq("user_id", user.id);
    updateError = result.error;
  } else if (step === 6) {
    const parsed = studyTargetSchema.safeParse(formData.get("dailyStudyTarget"));
    if (!parsed.success) return { step, error: "Choose a daily study target." };
    const result = await supabase.from("onboarding_responses").update({ daily_study_target: parsed.data }).eq("user_id", user.id);
    updateError = result.error;
  } else if (step === 7) {
    const selectedInterests = formData.get("skipInterests") === "true"
      ? []
      : formData.getAll("programmingInterests").filter((value): value is string => typeof value === "string");
    const parsed = interestsSchema.safeParse(selectedInterests);
    if (!parsed.success) return { step, error: parsed.error.issues[0]?.message ?? "Review your selected interests." };
    const result = await supabase.from("onboarding_responses").update({ programming_interests: parsed.data }).eq("user_id", user.id);
    updateError = result.error;
    if (!updateError) {
      const completed = await supabase.rpc("complete_student_onboarding");
      if (completed.error) return { step, error: "Complete the required questions before finishing." };
      redirect("/dashboard");
    }
  } else {
    return invalid("This onboarding step is not available.");
  }

  if (updateError) return { step, error: "We could not save that answer. Please try again." };

  const { data: nextStep, error: advanceError } = await supabase.rpc("advance_student_onboarding_step", {
    expected_step: step,
  });
  if (advanceError || typeof nextStep !== "number") {
    return { step, error: "We could not save your progress. Please try again." };
  }
  return { step: nextStep };
}

export async function goBackOnboardingStep() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/onboarding");
  const { error } = await supabase.rpc("rewind_student_onboarding_step");
  if (error) redirect("/onboarding?error=save");
  redirect("/onboarding");
}

export async function updateStudentProfile(
  _state: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = studentProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    collegeName: formData.get("collegeName"),
    degree: formData.get("degree"),
    branch: formData.get("branch"),
    currentYear: formData.get("currentYear"),
    graduationYear: formData.get("graduationYear"),
    programmingExperience: formData.get("programmingExperience"),
    placementGoal: formData.get("placementGoal"),
    dailyStudyTarget: formData.get("dailyStudyTarget"),
    programmingInterests: formData.getAll("programmingInterests").filter((value): value is string => typeof value === "string"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check your profile details." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/settings/profile");

  const { error } = await supabase.rpc("update_student_profile", {
    p_full_name: parsed.data.fullName,
    p_college_name: parsed.data.collegeName,
    p_degree: parsed.data.degree,
    p_branch: parsed.data.branch,
    p_current_year: parsed.data.currentYear,
    p_graduation_year: parsed.data.graduationYear,
    p_programming_experience: parsed.data.programmingExperience,
    p_placement_goal: parsed.data.placementGoal,
    p_daily_study_target: parsed.data.dailyStudyTarget,
    p_programming_interests: parsed.data.programmingInterests,
  });
  if (error) return { error: "We could not save your profile. Please try again." };
  return { success: "Profile saved." };
}
