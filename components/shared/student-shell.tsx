import Link from "next/link";
import { BookOpen, House, Settings2 } from "lucide-react";
import { logOut } from "@/app/actions/auth";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: House },
  { href: "/learning", label: "My learning", icon: BookOpen },
  { href: "/settings/profile", label: "Profile", icon: Settings2 },
] as const;

export function StudentShell({ children, active }: {
  children: React.ReactNode;
  active: (typeof navigation)[number]["href"];
}) {
  return <div className="flex min-h-0 flex-1">
    <aside className="hidden w-60 shrink-0 border-r border-border bg-card px-5 py-7 md:flex md:flex-col">
      <Link href="/" className="font-heading text-xl font-semibold tracking-tight">StudyBench</Link>
      <nav aria-label="Student navigation" className="mt-10 space-y-1">
        {navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={active === href ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors ${active === href ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><Icon size={18} aria-hidden="true" />{label}</Link>)}
      </nav>
      <form action={logOut} className="mt-auto pt-8"><button className="min-h-11 w-full rounded-md px-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Log out</button></form>
    </aside>

    <div className="flex min-w-0 flex-1 flex-col">
      <header className="flex h-14 items-center justify-between border-b border-border bg-background px-5 md:hidden">
        <Link href="/dashboard" className="font-heading font-semibold">StudyBench</Link>
        <form action={logOut}><button className="text-sm text-muted-foreground underline underline-offset-4">Log out</button></form>
      </header>
      <div className="flex flex-1 flex-col pb-20 md:pb-0">{children}</div>
      <nav aria-label="Student navigation" className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-border bg-card px-2 pb-[env(safe-area-inset-bottom)] pt-2 md:hidden">
        {navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={active === href ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 text-xs ${active === href ? "font-semibold text-foreground" : "text-muted-foreground"}`}><Icon size={18} aria-hidden="true" /><span>{label}</span></Link>)}
      </nav>
    </div>
  </div>;
}
