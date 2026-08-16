import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { createBeautyPalette } from "./beauty-profile.palette";
import type {
  BeautyColorProfile,
  BeautyProfileTaskState,
  UploadReservation,
} from "./beauty-profile.types";
import {
  perfectStartTaskSchema,
  perfectTaskSchema,
  perfectUploadSchema,
  type PerfectColorResult,
} from "./beauty-profile.validation";

const FILE_API_URL = "https://yce-api-01.makeupar.com/s2s/v2.0/file";
const TASK_API_URL = "https://yce-api-01.makeupar.com/s2s/v2.0/task/skin-tone-analysis";

export class PerfectCorpError extends Error {
  constructor(message: string, public readonly status = 502) {
    super(message);
    this.name = "PerfectCorpError";
  }
}

function getApiKey() {
  const apiKey = process.env.YOUCAM_API_KEY?.trim();
  if (!apiKey) throw new PerfectCorpError("Beauty Profile is not configured.", 503);
  return apiKey;
}

export function createTaskPollToken(userId: string, taskId: string) {
  return createHmac("sha256", getApiKey()).update(`${userId}:${taskId}`).digest("base64url");
}

export function verifyTaskPollToken(userId: string, taskId: string, token: string) {
  const expectedBuffer = Buffer.from(createTaskPollToken(userId, taskId));
  const tokenBuffer = Buffer.from(token);
  return expectedBuffer.length === tokenBuffer.length && timingSafeEqual(expectedBuffer, tokenBuffer);
}

async function requestPerfectCorp<T>(url: string, schema: z.ZodType<T>, init: RequestInit) {
  const response = await fetch(url, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
      ...init.headers,
    },
  });
  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (response.status === 401) {
      throw new PerfectCorpError("Beauty Profile is unavailable because the Perfect Corp API key is invalid.", 503);
    }
    const upstreamMessage = payload && typeof payload === "object" && "error" in payload
      ? String(payload.error)
      : `Perfect Corp request failed with status ${response.status}.`;
    throw new PerfectCorpError(upstreamMessage, response.status);
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) throw new PerfectCorpError("Perfect Corp returned an unexpected response.");
  return parsed.data;
}

export async function createUploadReservation(input: {
  fileName: string;
  fileSize: number;
  contentType: "image/jpeg" | "image/png";
}): Promise<UploadReservation> {
  const payload = await requestPerfectCorp(FILE_API_URL, perfectUploadSchema, {
    method: "POST",
    body: JSON.stringify({
      files: [{ content_type: input.contentType, file_name: input.fileName, file_size: input.fileSize }],
    }),
  });
  const file = payload.data.files[0];
  const upload = file?.requests[0];
  if (!file || !upload) throw new PerfectCorpError("Perfect Corp did not provide an upload URL.");
  return {
    fileId: file.file_id,
    upload: { method: upload.method, url: upload.url, headers: upload.headers },
  };
}

export async function startBeautyProfile(fileId: string) {
  const payload = await requestPerfectCorp(TASK_API_URL, perfectStartTaskSchema, {
    method: "POST",
    body: JSON.stringify({ src_file_id: fileId, face_angle_strictness_level: "flexible" }),
  });
  return payload.data.task_id;
}

function normalizeResult(result: PerfectColorResult): BeautyColorProfile {
  const colors = {
    skinColor: result.skin_color,
    eyeColor: result.eye_color,
    eyeColorName: result.eye_color_name,
    lipColor: result.lip_color,
    eyebrowColor: result.eyebrow_color,
    hairColor: result.hair_color,
    hairColorName: result.hair_color_name,
  };
  return { ...colors, palette: createBeautyPalette(colors) };
}

export async function getBeautyProfileTask(taskId: string): Promise<BeautyProfileTaskState> {
  const payload = await requestPerfectCorp(
    `${TASK_API_URL}/${encodeURIComponent(taskId)}`,
    perfectTaskSchema,
    { method: "GET" }
  );

  if (payload.data.task_status === "error") {
    throw new PerfectCorpError(
      payload.data.error_message ||
        (typeof payload.data.error === "string" ? payload.data.error : "The photo could not be read."),
      422
    );
  }
  if (payload.data.task_status !== "success") return { status: "running" };
  if (!payload.data.results) throw new PerfectCorpError("The completed profile contained no color results.");
  return { status: "success", result: normalizeResult(payload.data.results) };
}
