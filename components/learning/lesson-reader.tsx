import Link from "next/link";
import { ArrowLeft, ArrowRight, BookOpenCheck, Clock3 } from "lucide-react";
import { startPractice } from "@/app/actions/practice";
import type { LessonContent } from "@/lib/validations/lesson-content";
import type { LessonFormat } from "@/types/database";

type Lesson = {
  id: string;
  title: string;
  summary: string;
  estimated_minutes: number;
  learning_objectives: string[];
};

export function LessonReader({
  lesson,
  format,
  content,
  previous,
  next,
  practicePath,
}: {
  lesson: Lesson;
  format: LessonFormat;
  content: LessonContent;
  previous: string | null;
  next: string | null;
  practicePath: string;
}) {
  return <article className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
    <header className="border-b border-border pb-8">
      <Link href="/learning" className="inline-flex min-h-10 items-center gap-2 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"><ArrowLeft size={16} aria-hidden="true" />All learning paths</Link>
      <p className="mt-8 text-sm font-medium text-muted-foreground">{formatLabel(format)}</p>
      <h1 className="mt-2 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">{lesson.title}</h1>
      <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{lesson.summary}</p>
      <div className="mt-5 flex items-center gap-2 text-sm text-muted-foreground"><Clock3 size={15} aria-hidden="true" />{lesson.estimated_minutes} minutes</div>
    </header>

    <section className="border-b border-border py-8" aria-labelledby="objectives-title">
      <h2 id="objectives-title" className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">By the end, you can</h2>
      <ul className="mt-4 space-y-2">
        {lesson.learning_objectives.map((objective) => <li key={objective} className="flex gap-3 text-sm leading-6"><BookOpenCheck size={17} className="mt-1 shrink-0 text-muted-foreground" aria-hidden="true" /><span>{objective}</span></li>)}
      </ul>
    </section>

    <div className="space-y-9 py-8">
      <p className="text-lg leading-8">{content.intro}</p>
      {content.sections.map((section) => <section key={section.heading}>
        <h2 className="text-xl font-semibold tracking-tight">{section.heading}</h2>
        <div className="mt-3 space-y-4 text-base leading-7 text-muted-foreground">{section.paragraphs.map((paragraph, index) => <p key={`${section.heading}-${index}`}>{paragraph}</p>)}</div>
      </section>)}
      {content.lesson_format === "worked_calculation" && <section aria-labelledby="worked-example-title" className="border-y border-border py-7">
        <p className="text-sm font-medium text-muted-foreground">Worked example</p>
        <h2 id="worked-example-title" className="mt-2 text-xl font-semibold leading-7">{content.worked_example.prompt}</h2>
        <ol className="mt-5 space-y-4">
          {content.worked_example.steps.map((step, index) => <li key={step} className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-3 text-sm leading-6"><span className="flex size-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">{index + 1}</span><span className="pt-0.5">{step}</span></li>)}
        </ol>
        <p className="mt-6 border-l-2 border-foreground pl-4 text-base font-semibold">{content.worked_example.answer}</p>
        <p className="mt-2 pl-4 text-sm leading-6 text-muted-foreground">Check: {content.worked_example.check}</p>
      </section>}

      {content.lesson_format === "schema_explainer" && <section aria-labelledby="schema-title" className="border-y border-border py-7">
        <p className="text-sm font-medium text-muted-foreground">Read the schema</p>
        <h2 id="schema-title" className="sr-only">Database tables and relationships</h2>
        <div className="mt-4 grid gap-5 sm:grid-cols-2">
          {content.schema.tables.map((table) => <div key={table.name} className="min-w-0 border border-border bg-card p-4">
            <h3 className="font-mono text-sm font-semibold">{table.name}</h3>
            <ul className="mt-3 divide-y divide-border text-sm">
              {table.columns.map((column) => <li key={column.name} className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0">
                <span><span className="font-mono">{column.name}</span><span className="ml-2 text-muted-foreground">{column.type}</span></span>
                {column.key && <span className="text-right text-xs text-muted-foreground">{column.key}</span>}
              </li>)}
            </ul>
          </div>)}
        </div>
        <p className="mt-5 text-sm leading-6 text-muted-foreground">{content.schema.relationship}</p>
        <CodeBlock code={content.code} label="SQL schema example" />
      </section>}

      {content.lesson_format === "code_walkthrough" && <section aria-labelledby="walkthrough-title" className="border-y border-border py-7">
        <p className="text-sm font-medium text-muted-foreground">Trace the program</p>
        <h2 id="walkthrough-title" className="sr-only">Python example and line-by-line walkthrough</h2>
        <CodeBlock code={content.code} label="Python example" />
        <ol className="mt-5 space-y-3">
          {content.line_notes.map((item) => <li key={item.line} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 text-sm leading-6">
            <span className="font-mono text-muted-foreground">{item.line}</span><span>{item.note}</span>
          </li>)}
        </ol>
      </section>}

      {content.lesson_format === "problem_solving" && <section aria-labelledby="challenge-title" className="border-y border-border py-7">
        <p className="text-sm font-medium text-muted-foreground">Reason it out</p>
        <h2 id="challenge-title" className="mt-2 text-xl font-semibold leading-7">{content.challenge}</h2>
        <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-6 text-muted-foreground">
          {content.reasoning_steps.map((step) => <li key={step} className="pl-1">{step}</li>)}
        </ol>
        <p className="mt-5 border-l-2 border-foreground pl-4 text-sm font-semibold leading-6">{content.answer}</p>
        <dl className="mt-6 grid gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time</dt><dd className="mt-1 text-sm">{content.complexity.time}</dd></div>
          <div><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Auxiliary space</dt><dd className="mt-1 text-sm">{content.complexity.space}</dd></div>
          <div className="sm:col-span-2"><dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Assumption</dt><dd className="mt-1 text-sm leading-6 text-muted-foreground">{content.complexity.assumption}</dd></div>
        </dl>
      </section>}

      <section aria-labelledby="takeaways-title">
        <h2 id="takeaways-title" className="text-xl font-semibold tracking-tight">Key takeaways</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-7 text-muted-foreground">
          {content.key_takeaways.map((takeaway) => <li key={takeaway} className="pl-1">{takeaway}</li>)}
        </ul>
      </section>

      <section aria-labelledby="references-title" className="border-t border-border pt-6">
        <h2 id="references-title" className="text-sm font-semibold">Further reading</h2>
        <ul className="mt-3 space-y-2">
          {content.references.map((reference) => <li key={reference.url} className="text-sm leading-6">
            <a href={reference.url} target="_blank" rel="noreferrer" className="underline decoration-border underline-offset-4 hover:decoration-foreground">{reference.title}</a>
            <span className="text-muted-foreground"> · {reference.publisher}</span>
          </li>)}
        </ul>
      </section>

      <section className="border-t border-border pt-7" aria-labelledby="practice-title">
        <p className="text-sm font-medium text-muted-foreground">Check your understanding</p>
        <h2 id="practice-title" className="mt-2 text-xl font-semibold tracking-tight">Practice this lesson</h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Answer every question to mark the lesson complete. Your responses are evaluated on the server and explanations appear after each submission.</p>
        <form action={startPractice} className="mt-5">
          <input type="hidden" name="lessonId" value={lesson.id} />
          <input type="hidden" name="returnTo" value={practicePath} />
          <button className="min-h-11 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90">Start practice</button>
        </form>
      </section>
    </div>

    <nav aria-label="Lesson navigation" className="flex items-center justify-between gap-4 border-t border-border pt-6">
      {previous ? <Link href={previous} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline-offset-4 hover:underline"><ArrowLeft size={16} aria-hidden="true" />Previous</Link> : <span />}
      {next ? <Link href={next} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">Next lesson<ArrowRight size={16} aria-hidden="true" /></Link> : <Link href="/learning" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium underline-offset-4 hover:underline">Back to paths<ArrowRight size={16} aria-hidden="true" /></Link>}
    </nav>
  </article>;
}

function CodeBlock({ code, label }: { code: string; label: string }) {
  return <pre aria-label={label} className="mt-5 max-w-full overflow-x-auto border border-border bg-muted/50 p-4 text-sm leading-6 text-foreground"><code>{code}</code></pre>;
}

function formatLabel(format: LessonFormat) {
  switch (format) {
    case "worked_calculation": return "Worked calculation";
    case "schema_explainer": return "Schema explainer";
    case "code_walkthrough": return "Code walkthrough";
    case "problem_solving": return "Problem solving";
    default: return "Concept lesson";
  }
}
