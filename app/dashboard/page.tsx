import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { StudentShell } from "@/components/shared/student-shell";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/dashboard");

  const [{ data: profile }, { data: onboarding }, { data: gamification }] = await Promise.all([
    supabase.from("profiles").select("full_name, onboarding_completed").eq("id", user.id).maybeSingle(),
    supabase.from("onboarding_responses").select("daily_study_target").eq("user_id", user.id).maybeSingle(),
    supabase.rpc("get_my_gamification"),
  ]);
  if (!profile?.onboarding_completed) redirect("/onboarding");

  const name = profile.full_name.trim().split(" ")[0] || "there";
  const stats = gamification?.[0];

  return <StudentShell active="/dashboard">
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-10 sm:py-14">
      <header className="max-w-3xl">
        <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">Welcome, {name}.</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">Your placement preparation starts with a clear next step.</p>
      </header>

      <section className="mt-10 grid gap-8 border-y border-border py-7 sm:grid-cols-[1fr_auto] sm:items-center">
        <div><h2 className="text-lg font-semibold">Daily study target</h2><p className="mt-1 text-sm text-muted-foreground">The target you chose during onboarding.</p></div>
        <p className="text-2xl font-semibold tabular-nums">{onboarding?.daily_study_target ?? "—"}<span className="ml-2 text-sm font-normal text-muted-foreground">minutes</span></p>
      </section>

      <section className="mt-10 grid gap-6 border-b border-border pb-8 sm:grid-cols-3" aria-label="Learning activity">
        <div><p className="text-sm text-muted-foreground">Level</p><p className="mt-1 text-lg font-semibold">{stats?.level_name ?? "Beginner"}</p></div>
        <div><p className="text-sm text-muted-foreground">Total XP</p><p className="mt-1 text-lg font-semibold tabular-nums">{stats?.total_xp ?? 0}</p></div>
        <div><p className="text-sm text-muted-foreground">Current streak</p><p className="mt-1 text-lg font-semibold tabular-nums">{stats?.current_streak ?? 0} days</p></div>
      </section>

      <section className="mt-10 max-w-2xl">
        <h2 className="text-xl font-semibold">Continue learning</h2>
        <p className="mt-3 text-base leading-7 text-muted-foreground">There isn’t a lesson in progress yet. Choose a learning area to see its roadmap.</p>
        <Link href="/learning" className="mt-5 inline-flex min-h-11 items-center rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90">Browse learning areas</Link>
      </section>

      <p className="mt-14 text-sm text-muted-foreground"><Link href="/settings/profile" className="underline underline-offset-4 hover:text-foreground">Edit your profile and study preferences</Link></p>
    </main>
  </StudentShell>;
}
