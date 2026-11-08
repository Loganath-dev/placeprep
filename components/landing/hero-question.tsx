"use client";

import { useState } from "react";
import { Check, X } from "lucide-react";

const options = [
  { id: "a", label: "3 days" },
  { id: "b", label: "4 days" },
  { id: "c", label: "5 days" },
  { id: "d", label: "9 days" },
];

const correctId = "b";

export function HeroQuestion() {
  const [picked, setPicked] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);
  const isRight = picked === correctId;

  function reset() {
    setPicked(null);
    setChecked(false);
  }

  return (
    <div className="graph-paper rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-lg font-semibold">Try one: Time and Work</h2>
        <span className="shrink-0 text-sm text-muted-foreground">
          Sample question
        </span>
      </div>

      <p className="mt-4 leading-relaxed">
        A can finish a job in 12 days and B can finish it in 6 days. Working
        together, how many days will they take?
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        {options.map((option) => {
          const selected = picked === option.id;
          const isCorrectOption = checked && option.id === correctId;
          const isWrongPick = checked && selected && option.id !== correctId;

          let style = checked
            ? "border-border bg-background opacity-60"
            : "border-border bg-background hover:border-foreground";
          if (selected && !checked) {
            style = "border-foreground bg-highlighter/40";
          }
          if (isCorrectOption) style = "border-pass bg-pass/10";
          if (isWrongPick) style = "border-destructive bg-destructive/10";

          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              disabled={checked}
              onClick={() => setPicked(option.id)}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left font-medium transition-[border-color,background-color,transform] duration-150 active:scale-[0.98] ${style} ${
                isWrongPick ? "animate-shake" : ""
              }`}
            >
              {option.label}
              {isCorrectOption && (
                <Check className="size-4 animate-pop text-pass" />
              )}
              {isWrongPick && (
                <X className="size-4 animate-pop text-destructive" />
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        {checked ? (
          <button
            type="button"
            onClick={reset}
            className="rounded-md border border-foreground px-5 py-2.5 font-medium hover:bg-secondary"
          >
            Try again
          </button>
        ) : (
          <button
            type="button"
            disabled={picked === null}
            onClick={() => setChecked(true)}
            className="rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Check answer
          </button>
        )}
      </div>

      <div aria-live="polite">
        {checked && (
          <div className="mt-5 animate-pop border-t border-border pt-4">
            <p
              className={`font-medium ${isRight ? "text-pass" : "text-destructive"}`}
            >
              {isRight ? "Correct." : "Not quite. The answer is 4 days."}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              Add the work done in one day: 1/12 + 1/6 = 3/12 = 1/4. So
              together they finish the job in 4 days.
            </p>
            <p className="mt-3 text-sm">
              Every StudyBench lesson ends with questions like this, each with
              a worked explanation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}