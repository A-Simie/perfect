import { z } from "zod";

export const lookTemplateListSchema = z.object({
  status: z.number(),
  data: z.object({
    templates: z.array(z.object({
      id: z.string().min(1),
      thumb: z.string().url(),
      title: z.string().min(1),
      category_name: z.string().default("Look"),
    })),
    next_token: z.union([z.string(), z.number()]).nullish(),
  }),
});

export const startLookTaskInputSchema = z.object({
  fileId: z.string().min(1).max(500),
  templateId: z.string().min(1).max(200),
});

export const lookStartTaskSchema = z.object({
  status: z.number(),
  data: z.object({ task_id: z.string().min(1) }),
});

export const lookTaskSchema = z.object({
  status: z.number(),
  data: z.object({
    task_status: z.string(),
    results: z.object({ url: z.string().url() }).nullish(),
    error: z.unknown().nullish(),
    error_message: z.string().nullish(),
  }),
});
