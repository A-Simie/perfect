import { z } from "zod";

export const coordinatedLookFeatureSchema = z.enum(["clothing", "shoes", "necklace"]);

export const startCoordinatedLookTaskSchema = z.object({
  feature: coordinatedLookFeatureSchema,
  sourceFileId: z.string().min(1).max(500),
  garmentCategory: z.enum(["upper_body", "lower_body", "full_body"]).optional(),
  gender: z.enum(["female", "male"]).optional(),
  itemIndex: z.number().int().min(1).max(20).default(1),
});

export const coordinatedLookStartSchema = z.object({
  data: z.object({ task_id: z.string().min(1) }),
});

export const coordinatedLookTaskSchema = z.object({
  data: z.object({
    task_status: z.string(),
    error: z.unknown().nullish(),
    error_message: z.string().nullish(),
    results: z.object({ url: z.string().url() }).nullish(),
  }),
});
