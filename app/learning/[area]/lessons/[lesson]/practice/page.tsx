import { notFound, redirect } from "next/navigation";
import { z } from "zod";
import { PracticeRunner, type PracticeQuestion } from "@/components/learning/practice-runner";
import { StudentShell } from "@/components/shared/student-shell";
import { createClient } from "@/lib/supabase/server";

const optionSchema = z.object({ key: z.string(), body: z.string(), sort_order: z.number() });

export default async function PracticePage({
  params,
  searchParams,
}: PageProps<"/learning/[area]/lessons/[lesson]/practice">) {
  const [{ area: areaSlug, lesson: lessonSlug }, query] = await Promise.all([params, searchParams]);
  const sessionId = z.uuid().safeParse(query.session);
  const lessonPath = `/learning/${areaSlug}/lessons/${lessonSlug}`;
  if (!sessionId.success) redirect(lessonPath);

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`${lessonPath}/practice?session=${sessionId.data}`)}`);
  const [{ data: profile }, { data: area }] = await Promise.all([
    supabase.from("profiles").select("onboarding_completed").eq("id", user.id).maybeSingle(),
    supabase.from("learning_areas").select("id").eq("slug", areaSlug).eq("is_published", true).maybeSingle(),
  ]);
  if (!profile?.onboarding_completed) redirect("/onboarding");
  if (!area) notFound();

  const [{ data: lesson }, { data: session }] = await Promise.all([
    supabase.from("lessons").select("id, title").eq("learning_area_id", area.id).eq("slug", lessonSlug).eq("publication_status", "published").maybeSingle(),
    supabase.from("practice_sessions").select("id, lesson_id, status").eq("id", sessionId.data).maybeSingle(),
  ]);
  if (!lesson || !session || session.lesson_id !== lesson.id) notFound();

  const { data: records, error } = await supabase.rpc("get_practice_session_questions", { target_session_id: sessionId.data });
  if (error || !records?.length) notFound();
  const questions: PracticeQuestion[] = records.map((record) => ({
    question_id: record.question_id,
    question_type: record.question_type,
    prompt: record.prompt,
    code_snippet: record.code_snippet,
    sort_order: record.sort_order,
    options: z.array(optionSchema).catch([]).parse(record.options),
    submitted_answer: record.submitted_answer,
    is_correct: record.is_correct,
  }));

  return <StudentShell active="/learning">
    <main className="flex-1"><PracticeRunner questions={questions} sessionId={sessionId.data} lessonPath={lessonPath} /></main>
  </StudentShell>;
}
