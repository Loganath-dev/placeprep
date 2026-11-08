import { z } from "zod";

const referenceSchema = z.object({ title: z.string().min(1), publisher: z.string().min(1), url: z.string().url() });
const sectionSchema = z.object({ heading: z.string().min(1), paragraphs: z.array(z.string().min(1)).min(1) });
const baseSchema = z.object({
  intro: z.string().min(1),
  sections: z.array(sectionSchema).min(1),
  key_takeaways: z.array(z.string().min(1)).min(1),
  references: z.array(referenceSchema).min(1),
});

export const lessonContentSchema = z.discriminatedUnion("lesson_format", [
  baseSchema.extend({
    lesson_format: z.literal("worked_calculation"),
    worked_example: z.object({ prompt: z.string(), steps: z.array(z.string()), answer: z.string(), check: z.string() }),
  }),
  baseSchema.extend({
    lesson_format: z.literal("schema_explainer"),
    schema: z.object({
      tables: z.array(z.object({ name: z.string(), columns: z.array(z.object({ name: z.string(), type: z.string(), key: z.string() })) })),
      relationship: z.string(),
    }),
    code: z.string(),
  }),
  baseSchema.extend({
    lesson_format: z.literal("code_walkthrough"),
    code: z.string(),
    line_notes: z.array(z.object({ line: z.number().int().positive(), note: z.string() })),
  }),
  baseSchema.extend({
    lesson_format: z.literal("problem_solving"),
    challenge: z.string(),
    reasoning_steps: z.array(z.string()),
    answer: z.string(),
    complexity: z.object({ time: z.string(), space: z.string(), assumption: z.string() }),
  }),
  baseSchema.extend({ lesson_format: z.literal("concept_lesson") }),
]);

export type LessonContent = z.infer<typeof lessonContentSchema>;

export function parseLessonContent(format: string, content: unknown): LessonContent | null {
  const result = lessonContentSchema.safeParse({
    ...(content && typeof content === "object" && !Array.isArray(content) ? content : {}),
    lesson_format: format,
  });
  return result.success ? result.data : null;
}
