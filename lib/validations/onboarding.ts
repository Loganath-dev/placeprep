import { z } from "zod";

export const programmingExperienceSchema = z.enum(["beginner", "intermediate", "advanced"]);
export const placementGoalSchema = z.enum(["service", "product", "both", "undecided"]);
export const studyTargetSchema = z.coerce.number().pipe(z.union([
  z.literal(15),
  z.literal(30),
  z.literal(45),
  z.literal(60),
  z.literal(90),
]));

export const fullNameSchema = z.string().trim().min(2, "Enter your full name.").max(100);
export const collegeSchema = z.string().trim().min(2, "Enter your college name.").max(160);
export const academicSchema = z.object({
  degree: z.string().trim().min(2, "Enter your degree.").max(100),
  branch: z.string().trim().min(2, "Enter your branch or field of study.").max(120),
  currentYear: z.coerce.number().int().min(1).max(8),
  graduationYear: z.coerce.number().int().min(2000).max(2100),
});
export const interestsSchema = z.array(z.enum([
  "c",
  "cpp",
  "java",
  "python",
  "javascript",
  "sql",
  "csharp",
  "aptitude",
  "cs_core",
  "dsa",
])).max(10, "Choose up to ten interests.");

export type OnboardingValues = {
  fullName: string;
  collegeName: string;
  degree: string;
  branch: string;
  currentYear: number | null;
  graduationYear: number | null;
  programmingExperience: "beginner" | "intermediate" | "advanced" | null;
  placementGoal: "service" | "product" | "both" | "undecided" | null;
  dailyStudyTarget: number | null;
  programmingInterests: string[];
};

export type OnboardingActionState = {
  step: number;
  error?: string;
} | undefined;
