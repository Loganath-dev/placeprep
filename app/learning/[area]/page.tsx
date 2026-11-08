import { notFound, redirect } from "next/navigation";
import { RoadmapList } from "@/components/learning/roadmap-list";
import { StudentShell } from "@/components/shared/student-shell";
import { createClient } from "@/lib/supabase/server";

export default async function LearningAreaPage({ params }: PageProps<"/learning/[area]">) {
  const { area: slug } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/learning/${slug}`)}`);

  const [{ data: profile }, { data: area }] = await Promise.all([
    supabase.from("profiles").select("onboarding_completed").eq("id", user.id).maybeSingle(),
    supabase.from("learning_areas").select("title, summary").eq("slug", slug).eq("is_published", true).maybeSingle(),
  ]);
  if (!profile?.onboarding_completed) redirect("/onboarding");
  if (!area) notFound();

  const { data: nodes, error } = await supabase.rpc("get_learning_roadmap", { area_slug: slug });

  return <StudentShell active="/learning">
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:py-14">
      <header className="max-w-3xl">
        <p className="text-sm font-medium text-muted-foreground">Learning path</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">{area.title}</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">{area.summary}</p>
      </header>
      {error ? <section className="mt-10 max-w-2xl border-y border-border py-7" role="status">
        <h2 className="text-lg font-semibold">Roadmap unavailable</h2>
        <p className="mt-2 text-base leading-7 text-muted-foreground">We could not load this path right now. Please try again later.</p>
      </section> : <RoadmapList nodes={nodes ?? []} areaSlug={slug} />}
    </main>
  </StudentShell>;
}
