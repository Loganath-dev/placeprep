import { notFound, redirect } from "next/navigation";
import { LessonReader } from "@/components/learning/lesson-reader";
import { StudentShell } from "@/components/shared/student-shell";
import { createClient } from "@/lib/supabase/server";
import { parseLessonContent } from "@/lib/validations/lesson-content";

export default async function LessonPage({ params }: PageProps<"/learning/[area]/lessons/[lesson]">) {
  const { area: areaSlug, lesson: lessonSlug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/learning/${areaSlug}/lessons/${lessonSlug}`)}`);

  const [{ data: profile }, { data: area }] = await Promise.all([
    supabase.from("profiles").select("onboarding_completed").eq("id", user.id).maybeSingle(),
    supabase.from("learning_areas").select("id, title").eq("slug", areaSlug).eq("is_published", true).maybeSingle(),
  ]);
  if (!profile?.onboarding_completed) redirect("/onboarding");
  if (!area) notFound();

  const { data: lesson } = await supabase.from("lessons").select("*")
    .eq("learning_area_id", area.id).eq("slug", lessonSlug)
    .eq("publication_status", "published").maybeSingle();
  if (!lesson) notFound();

  const { data: roadmap } = await supabase.rpc("get_learning_roadmap", { area_slug: areaSlug });
  const lessonNode = roadmap?.find((node) => node.lesson_id === lesson.id && node.node_type === "lesson");
  if (!lessonNode || lessonNode.node_state === "locked") notFound();

  const { error: openError } = await supabase.rpc("open_roadmap_node", { target_node_id: lessonNode.node_id });
  if (openError) notFound();

  const orderedLessons = (roadmap ?? []).filter((node) =>
    node.node_type === "lesson" && node.lesson_slug && node.node_state !== "locked",
  );
  const lessonIndex = orderedLessons.findIndex((node) => node.node_id === lessonNode.node_id);
  const previous = lessonIndex > 0 && orderedLessons[lessonIndex - 1]?.lesson_slug
    ? `/learning/${areaSlug}/lessons/${orderedLessons[lessonIndex - 1].lesson_slug}` : null;
  const next = lessonIndex >= 0 && lessonIndex < orderedLessons.length - 1 && orderedLessons[lessonIndex + 1]?.lesson_slug
    ? `/learning/${areaSlug}/lessons/${orderedLessons[lessonIndex + 1].lesson_slug}` : null;
  const content = parseLessonContent(lesson.lesson_format, lesson.content);

  return <StudentShell active="/learning">
    <main className="flex-1">
      {content ? <LessonReader lesson={lesson} format={lesson.lesson_format} content={content} previous={previous} next={next} practicePath={`/learning/${areaSlug}/lessons/${lessonSlug}`} /> : <section className="mx-auto max-w-2xl px-5 py-16" role="status">
        <h1 className="text-xl font-semibold">This lesson is being reviewed</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Its content did not pass the reader’s format checks, so it is temporarily unavailable.</p>
      </section>}
    </main>
  </StudentShell>;
}
