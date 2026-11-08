"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Reveal } from "@/components/shared/reveal";
import { site } from "@/lib/site";

const linkStyle = "underline underline-offset-4 hover:text-foreground";

const faqs: { q: string; a: ReactNode }[] = [
  {
    q: "What do I get for free?",
    a: "The first 2 lessons of every subject, language and path, plus one of the five company mock tests. That is enough to see how StudyBench teaches before you pay anything.",
  },
  {
    q: "Are the mock tests the real company papers?",
    a: "No. They are original practice tests written in the style and section layout of each company's assessment. They are not official papers, and StudyBench is not affiliated with those companies.",
  },
  {
    q: "Can I run code on StudyBench?",
    a: "Not at the moment. The language tracks teach concepts with syntax examples, code walkthroughs, output prediction, find-the-error questions and quizzes. There is no online compiler or code judge.",
  },
  {
    q: "Do I need to know programming already?",
    a: "No. Each path starts from the basics. You tell us your experience when you sign up, and we suggest where to begin.",
  },
  {
    q: "How does Premium work?",
    a: (
      <>
        You pay once for 3 months (₹199) or 1 year (₹599). There is no
        automatic renewal, and all payments are final, so we suggest trying
        the Free plan first. When your plan ends, your account returns to free
        access, and your XP, streak and completed lessons stay as they were.
        See the{" "}
        <Link href="/terms#payments" className={linkStyle}>
          Terms of Service
        </Link>{" "}
        for details.
      </>
    ),
  },
  {
    q: "How do XP, levels and streaks work?",
    a: "You earn XP for finishing lessons, practice sets, unit challenges and mock tests. XP adds up to levels, from Beginner up to Placement Ready. Study on consecutive days to build a streak. Your XP is recorded on our server when you complete something.",
  },
  {
    q: "What do you do with my data?",
    a: (
      <>
        We collect what we need to run your account and show your progress,
        such as your email, your profile answers and your lesson activity. We
        do not sell your personal data. Details are in the{" "}
        <Link href="/privacy" className={linkStyle}>
          privacy policy
        </Link>
        .
      </>
    ),
  },
  {
    q: "Does it work on my phone?",
    a: "Yes. StudyBench works in your phone's browser. There is no separate app yet.",
  },
  {
    q: "Who can sign up?",
    a: "You need to be 18 or older to create an account.",
  },
  {
    q: "How do I contact you?",
    a: (
      <>
        Email{" "}
        <a href={`mailto:${site.supportEmail}`} className={linkStyle}>
          {site.supportEmail}
        </a>
        . Formal complaints go to our Grievance Officer, whose details are in
        the{" "}
        <Link href="/terms" className={linkStyle}>
          terms of service
        </Link>
        .
      </>
    ),
  },
];

function Item({ q, children }: { q: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-t border-border">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 py-5 text-left font-medium"
      >
        {q}
        <Plus
          className={`size-5 shrink-0 transition-transform duration-300 ${
            open ? "rotate-45" : ""
          }`}
        />
      </button>
      <div
        inert={!open}
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="max-w-xl pb-5 leading-relaxed text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-4 border-t border-border">
      <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <Reveal>
          <h2 className="text-3xl font-semibold leading-tight">Questions</h2>
        </Reveal>
        <Reveal delay={100} className="mt-8 border-b border-border">
          {faqs.map((item) => (
            <Item key={item.q} q={item.q}>
              {item.a}
            </Item>
          ))}
        </Reveal>
      </div>
    </section>
  );
}