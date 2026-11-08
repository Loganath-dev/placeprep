"use client";

import { useActionState, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, CircleHelp, X } from "lucide-react";
import { completeLessonFromPractice, submitPracticeAnswer, type PracticeFormState } from "@/app/actions/practice";

export type PracticeQuestion = {
  question_id: string;
  question_type: "single_choice" | "multiple_choice" | "output_prediction" | "find_error" | "numerical";
  prompt: string;
  code_snippet: string | null;
  sort_order: number;
  options: { key: string; body: string; sort_order: number }[];
  submitted_answer: unknown | null;
  is_correct: boolean | null;
};

const initialState: PracticeFormState = {};

export function PracticeRunner({ questions, sessionId, lessonPath }: {
  questions: PracticeQuestion[];
  sessionId: string;
  lessonPath: string;
}) {
  const [index, setIndex] = useState(0);
  const [selection, setSelection] = useState<string[]>(() => savedSelection(questions[0]?.submitted_answer));
  const [numericValue, setNumericValue] = useState(() => savedNumericalValue(questions[0]?.submitted_answer));
  const [state, formAction, pending] = useActionState(submitPracticeAnswer, initialState);
  const question = questions[index];
  const feedback = state.feedback?.questionId === question.question_id ? state.feedback : undefined;
  const storedAnswered = question.is_correct !== null;
  const answered = storedAnswered || Boolean(feedback);
  const isNumerical = question.question_type === "numerical";

  const answer = useMemo(() => isNumerical ? { value: numericValue } : { selected: selection }, [isNumerical, numericValue, selection]);
  const canSubmit = isNumerical ? numericValue.trim().length > 0 : selection.length > 0;
  const sessionFinished = feedback?.sessionCompleted || questions.every((item) => item.is_correct !== null);

  function chooseOption(optionKey: string) {
    if (answered) return;
    if (question.question_type === "multiple_choice") {
      setSelection((current) => current.includes(optionKey) ? current.filter((key) => key !== optionKey) : [...current, optionKey]);
    } else setSelection([optionKey]);
  }

  function moveTo(nextIndex: number) {
    const nextQuestion = questions[nextIndex];
    if (!nextQuestion) return;
    setIndex(nextIndex);
    setSelection(savedSelection(nextQuestion.submitted_answer));
    setNumericValue(savedNumericalValue(nextQuestion.submitted_answer));
  }

  return <section className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14" aria-labelledby="practice-title">
    <header className="border-b border-border pb-6">
      <p className="text-sm font-medium text-muted-foreground">Lesson practice</p>
      <h1 id="practice-title" className="mt-2 text-3xl font-semibold tracking-tight">Check your understanding</h1>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">Question {index + 1} of {questions.length}</p>
      <div className="mt-4 h-1 bg-muted" aria-label={`${index + 1} of ${questions.length} questions`} role="progressbar" aria-valuemin={1} aria-valuemax={questions.length} aria-valuenow={index + 1}>
        <div className="h-full bg-foreground transition-[width]" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
      </div>
    </header>

    <div className="py-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{questionLabel(question.question_type)}</p>
      <h2 className="mt-3 text-xl font-semibold leading-8">{question.prompt}</h2>
      {question.code_snippet && <pre className="mt-5 overflow-x-auto border border-border bg-muted/50 p-4 text-sm leading-6"><code>{question.code_snippet}</code></pre>}

      <form action={formAction} className="mt-7">
        <input type="hidden" name="sessionId" value={sessionId} />
        <input type="hidden" name="questionId" value={question.question_id} />
        <input type="hidden" name="answer" value={JSON.stringify(answer)} />
        {isNumerical ? <label className="block max-w-sm">
          <span className="sr-only">Numerical answer</span>
          <input type="text" inputMode="decimal" value={numericValue} disabled={answered} onChange={(event) => setNumericValue(event.target.value)} className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70" placeholder="Enter your answer" />
        </label> : <fieldset className="space-y-3">
          <legend className="sr-only">Answer choices</legend>
          {question.options.map((option) => {
            const chosen = selection.includes(option.key);
            const inputType = question.question_type === "multiple_choice" ? "checkbox" : "radio";
            return <label key={option.key} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-md border px-4 text-sm leading-6 transition-colors ${chosen ? "border-foreground bg-muted" : "border-border hover:bg-muted/60"} ${answered ? "cursor-default" : ""}`}>
              <input type={inputType} name="visible-answer" value={option.key} checked={chosen} disabled={answered} onChange={() => chooseOption(option.key)} className="size-4 accent-foreground" />
              <span>{option.body}</span>
            </label>;
          })}
        </fieldset>}
        {state.error && <p className="mt-4 text-sm text-destructive" role="alert">{state.error}</p>}
        {!answered && <button disabled={!canSubmit || pending} className="mt-6 min-h-11 rounded-md bg-foreground px-4 text-sm font-medium text-background disabled:cursor-not-allowed disabled:opacity-50">{pending ? "Checking…" : "Check answer"}</button>}
      </form>

      {feedback && <div className={`mt-6 border-l-2 py-1 pl-4 ${feedback.isCorrect ? "border-foreground" : "border-destructive"}`} role="status">
        <div className="flex items-center gap-2 text-sm font-semibold">{feedback.isCorrect ? <Check size={16} aria-hidden="true" /> : <X size={16} aria-hidden="true" />}{feedback.isCorrect ? "Correct" : "Not quite"}</div>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{feedback.explanation}</p>
      </div>}
      {storedAnswered && !feedback && <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground"><CircleHelp size={16} aria-hidden="true" />This answer was submitted earlier. Start a new session to review its explanation.</p>}
    </div>

    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
      <button type="button" onClick={() => moveTo(Math.max(0, index - 1))} disabled={index === 0} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium disabled:opacity-40"><ChevronLeft size={16} aria-hidden="true" />Previous</button>
      {sessionFinished ? <form action={completeLessonFromPractice}>
        <input type="hidden" name="sessionId" value={sessionId} />
        <input type="hidden" name="returnTo" value={lessonPath} />
        <button className="min-h-11 rounded-md bg-foreground px-4 text-sm font-medium text-background">Complete lesson</button>
      </form> : <button type="button" onClick={() => moveTo(Math.min(questions.length - 1, index + 1))} disabled={index === questions.length - 1} className="inline-flex min-h-11 items-center gap-2 text-sm font-medium disabled:opacity-40">Next<ChevronRight size={16} aria-hidden="true" /></button>}
    </footer>
  </section>;
}

function questionLabel(type: PracticeQuestion["question_type"]) {
  switch (type) {
    case "multiple_choice": return "Select all that apply";
    case "numerical": return "Numerical answer";
    case "output_prediction": return "Predict the output";
    case "find_error": return "Find the error";
    default: return "Choose one answer";
  }
}

function savedSelection(submitted: unknown): string[] {
  if (submitted && typeof submitted === "object" && "selected" in submitted && Array.isArray(submitted.selected)) {
    return submitted.selected.filter((value): value is string => typeof value === "string");
  }
  return [];
}

function savedNumericalValue(submitted: unknown) {
  return submitted && typeof submitted === "object" && "value" in submitted && typeof submitted.value === "string" ? submitted.value : "";
}
