import { z } from "zod";
import {
  interestsSchema,
  placementGoalSchema,
  programmingExperienceSchema,
  studyTargetSchema,
} from "./onboarding";

export const studentProfileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(100),
  collegeName: z.string().trim().min(2, "Enter your college name.").max(160),
  degree: z.string().trim().min(2, "Enter your degree.").max(100),
  branch: z.string().trim().min(2, "Enter your branch or field of study.").max(120),
  currentYear: z.coerce.number().int().min(1).max(8),
  graduationYear: z.coerce.number().int().min(2000).max(2100),
  programmingExperience: programmingExperienceSchema,
  placementGoal: placementGoalSchema,
  dailyStudyTarget: studyTargetSchema,
  programmingInterests: interestsSchema,
});
