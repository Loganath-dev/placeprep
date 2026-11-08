"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { safeNextPath } from "@/lib/validations/auth";
import type { Json } from "@/types/database";

const uuid = z.uuid("Practice activity is invalid.");
const selectedAnswer = z.object({ selected: z.array(z.string().regex(/^[a-z0-9_-]{1,40}$/)).min(1).max(20) });
const numericalAnswer = z.object({ value: z.string().trim().min(1).max(80) });
const submittedAnswer = z.union([selectedAnswer, numericalAnswer]);

export type PracticeFormState = {
  error?: string;
  feedback?: {
    questionId: string;
    isCorrect: boolean;
    explanation: string;
    correctAnswer: Json;
    sessionCompleted: boolean;
    correctAnswers: number;
    answeredCount: number;
  };
};

export async function startPractice(formData: FormData) {
  const lessonId = uuid.safeParse(formData.get("lessonId"));
  const returnTo = safeNextPath(formData.get("returnTo"));
  if (!lessonId.success) redirect(returnTo);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);

  const { data: sessionId, error } = await supabase.rpc("start_practice_session", { target_lesson_id: lessonId.data });
  if (error || !sessionId) redirect(`${returnTo}?practice=unavailable`);
  redirect(`${returnTo}/practice?session=${sessionId}`);
}

export async function submitPracticeAnswer(_state: PracticeFormState, formData: FormData): Promise<PracticeFormState> {
  const parsedSession = uuid.safeParse(formData.get("sessionId"));
  const parsedQuestion = uuid.safeParse(formData.get("questionId"));
  const rawAnswer = formData.get("answer");
  if (!parsedSession.success || !parsedQuestion.success || typeof rawAnswer !== "string") {
    return { error: "Your answer could not be checked. Refresh and try again." };
  }

  let answer: unknown;
  try { answer = JSON.parse(rawAnswer); } catch { return { error: "Your answer format is invalid." }; }
  const parsedAnswer = submittedAnswer.safeParse(answer);
  if (!parsedAnswer.success) return { error: parsedAnswer.error.issues[0]?.message ?? "Choose an answer before continuing." };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Your session has ended. Sign in and try again." };

  const { data, error } = await supabase.rpc("submit_practice_answer", {
    target_session_id: parsedSession.data,
    target_question_id: parsedQuestion.data,
    submitted: parsedAnswer.data,
  });
  const result = data?.[0];
  if (error || !result) {
    return { error: error?.code === "23505" ? "This answer was already submitted." : "We could not check that answer. Please try again." };
  }
  return {
    feedback: {
      questionId: parsedQuestion.data,
      isCorrect: result.is_correct,
      explanation: result.explanation,
      correctAnswer: result.correct_answer,
      sessionCompleted: result.session_completed,
      correctAnswers: result.correct_answers,
      answeredCount: result.answered_count,
    },
  };
}

export async function completeLessonFromPractice(formData: FormData) {
  const sessionId = uuid.safeParse(formData.get("sessionId"));
  const returnTo = safeNextPath(formData.get("returnTo"));
  if (!sessionId.success) redirect(returnTo);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  const { error } = await supabase.rpc("complete_lesson_from_practice", { target_session_id: sessionId.data });
  if (error) redirect(`${returnTo}?practice=completion-error`);
  revalidatePath(returnTo);
  revalidatePath("/learning");
  redirect(returnTo);
}
