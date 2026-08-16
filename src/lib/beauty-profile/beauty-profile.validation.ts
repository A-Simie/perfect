import { z } from "zod";
import { MAX_BEAUTY_PROFILE_FILE_SIZE } from "./beauty-profile.constants";

export const uploadMetadataSchema = z.object({
  fileName: z.string().trim().min(1).max(180),
  fileSize: z.number().int().positive().max(MAX_BEAUTY_PROFILE_FILE_SIZE),
  contentType: z.enum(["image/jpeg", "image/png"]),
});

export const startTaskSchema = z.object({
  fileId: z.string().trim().min(1).max(500),
});

const perfectUploadSchema = z.object({
  status: z.number(),
  data: z.object({
    files: z.array(
      z.object({
        file_id: z.string(),
        requests: z.array(
          z.object({
            method: z.string(),
            url: z.url(),
            headers: z.record(z.string(), z.string()).default({}),
          })
        ),
      })
    ),
  }),
});

const perfectStartTaskSchema = z.object({
  status: z.number(),
  data: z.object({ task_id: z.string() }),
});

const perfectColorResultSchema = z.object({
  skin_color: z.string(),
  eye_color: z.string(),
  eye_color_name: z.string().default("Detected eye color"),
  lip_color: z.string(),
  eyebrow_color: z.string(),
  hair_color: z.string(),
  hair_color_name: z.string().default("Detected hair color"),
});

const perfectTaskSchema = z.object({
  status: z.number(),
  data: z.object({
    error: z.unknown().optional().nullable(),
    error_message: z.string().optional().nullable(),
    task_status: z.string(),
    results: perfectColorResultSchema.optional().nullable(),
  }),
});

export type PerfectColorResult = z.infer<typeof perfectColorResultSchema>;
export { perfectStartTaskSchema, perfectTaskSchema, perfectUploadSchema };
