import { BookOpen, Check, Circle, Clock3, LockKeyhole, RotateCcw } from "lucide-react";
import Link from "next/link";
import type { Database } from "@/types/database";

type RoadmapNode = Database["public"]["Functions"]["get_learning_roadmap"]["Returns"][number];

const stateLabels: Record<RoadmapNode["node_state"], string> = {
  needs_revision: "Review recommended",
  completed: "Completed",
  locked: "Locked",
  current: "Up next",
  available: "Available",
};

export function RoadmapList({ nodes, areaSlug }: { nodes: RoadmapNode[]; areaSlug: string }) {
  if (!nodes.length) return <section className="mt-10 max-w-2xl border-y border-border py-7">
    <h2 className="text-lg font-semibold">The roadmap is taking shape</h2>
    <p className="mt-2 text-base leading-7 text-muted-foreground">This path has no published activities yet. Draft content stays hidden until it passes review.</p>
  </section>;

  return <ol className="mt-10 max-w-3xl">
    {nodes.map((node, index) => {
      const Icon = node.node_state === "completed" ? Check
        : node.node_state === "locked" ? LockKeyhole
          : node.node_state === "needs_revision" ? RotateCcw
            : node.node_type === "lesson" ? BookOpen : Circle;
      return <li key={node.node_id} className="relative grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-4 pb-8 last:pb-0">
        {index < nodes.length - 1 && <span aria-hidden="true" className="absolute bottom-0 left-[1.05rem] top-8 w-px bg-border" />}
        <span className={`relative z-10 flex size-9 items-center justify-center rounded-full border bg-background ${node.node_state === "current" ? "border-foreground text-foreground" : "border-border text-muted-foreground"}`}>
          <Icon size={16} aria-hidden="true" />
        </span>
        <div className="min-w-0 border-b border-border pb-7 last:border-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {node.node_type === "lesson" && node.lesson_slug && node.node_state !== "locked"
              ? <h2 className="text-base font-semibold leading-6"><Link href={`/learning/${areaSlug}/lessons/${node.lesson_slug}`} className="underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">{node.title}</Link></h2>
              : <h2 className="text-base font-semibold leading-6">{node.title}</h2>}
            <span className="text-xs font-medium text-muted-foreground">{stateLabels[node.node_state]}</span>
          </div>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{node.summary}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>{node.subject_title} · {node.unit_title}{node.topic_title ? ` · ${node.topic_title}` : ""}</span>
            {node.estimated_minutes && <span className="inline-flex items-center gap-1"><Clock3 size={13} aria-hidden="true" />{node.estimated_minutes} min</span>}
            {node.locked_reason === "premium" && <span>Premium path</span>}
            {node.locked_reason === "prerequisite" && <span>Complete prerequisites first</span>}
            {node.mastery_score !== null && <span>Mastery {node.mastery_score}%</span>}
          </div>
        </div>
      </li>;
    })}
  </ol>;
}
