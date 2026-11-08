import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { StudentShell } from "@/components/shared/student-shell";
import { createClient } from "@/lib/supabase/server";

export default async function LearningPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/learning");

  const [{ data: profile }, { data: areas, error }] = await Promise.all([
    supabase.from("profiles").select("onboarding_completed").eq("id", user.id).maybeSingle(),
    supabase.from("learning_areas").select("id, slug, title, summary, sort_order")
      .eq("is_published", true).order("sort_order"),
  ]);

  if (!profile?.onboarding_completed) {
    redirect("/onboarding");
  }

  return <StudentShell active="/learning">
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:py-14">
      <header className="max-w-3xl">
        <p className="text-sm font-medium text-muted-foreground">Your roadmap</p>
        <h1 className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">My learning</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">Choose a path to see what comes next and how each step connects.</p>
      </header>

      {error ? <section className="mt-10 max-w-2xl border-y border-border py-7" role="status">
        <h2 className="text-lg font-semibold">Learning paths are being prepared</h2>
        <p className="mt-2 text-base leading-7 text-muted-foreground">The roadmap database migration must be applied before paths can be loaded.</p>
      </section> : areas?.length ? <ul className="mt-10 grid gap-x-12 sm:grid-cols-2">
        {areas.map((area) => <li key={area.id} className="border-t border-border py-6">
          <Link href={`/learning/${area.slug}`} className="group flex min-h-24 items-start justify-between gap-5 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span>
              <span className="block text-xl font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">{area.title}</span>
              <span className="mt-2 block max-w-sm text-sm leading-6 text-muted-foreground">{area.summary}</span>
            </span>
            <ArrowUpRight className="mt-1 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" size={19} aria-hidden="true" />
          </Link>
        </li>)}
      </ul> : <section className="mt-10 max-w-2xl border-y border-border py-7">
        <h2 className="text-lg font-semibold">No published learning paths yet</h2>
        <p className="mt-2 text-base leading-7 text-muted-foreground">StudyBench is preparing its first reviewed lessons. Your learning progress will appear here once a path is published.</p>
      </section>}
    </main>
  </StudentShell>;
}
