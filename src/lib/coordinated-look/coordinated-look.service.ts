import "server-only";

import { readFile } from "node:fs/promises";
import { basename, join } from "node:path";
import {
  createUploadReservation,
  PerfectCorpError,
  requestPerfectCorp,
} from "@/lib/beauty-profile/beauty-profile.service";
import type { CoordinatedLookFeature, CoordinatedLookTaskState } from "./coordinated-look.types";
import { coordinatedLookStartSchema, coordinatedLookTaskSchema } from "./coordinated-look.validation";

const TASK_URLS: Record<CoordinatedLookFeature, string> = {
  clothing: "https://yce-api-01.makeupar.com/s2s/v2.0/task/cloth-v4",
  shoes: "https://yce-api-01.makeupar.com/s2s/v2.0/task/shoes",
  necklace: "https://yce-api-01.makeupar.com/s2s/v2.0/task/2d-vto/necklace",
};

const CATALOG_FILE_PATTERN = /^(?:outfit-(?:upper|lower|full)|shoes|necklace)-\d{2}\.jpg$/;
const catalogFileUploads = new Map<string, Promise<string>>();

async function uploadCatalogReference(referencePath: string) {
  const fileName = basename(referencePath);
  if (fileName !== referencePath || !CATALOG_FILE_PATTERN.test(fileName)) {
    throw new PerfectCorpError("Choose a valid catalog item.", 400);
  }

  const existingUpload = catalogFileUploads.get(fileName);
  if (existingUpload) return existingUpload;

  const upload = (async () => {
    const contents = await readFile(join(process.cwd(), "public", "catalog", fileName)).catch(() => {
      throw new PerfectCorpError("The selected catalog item is unavailable.", 404);
    });
    const reservation = await createUploadReservation({
      fileName,
      fileSize: contents.byteLength,
      contentType: "image/jpeg",
    });
    const response = await fetch(reservation.upload.url, {
      method: reservation.upload.method,
      headers: reservation.upload.headers,
      body: contents,
    });
    if (!response.ok) throw new PerfectCorpError("The catalog image upload did not complete.");
    return reservation.fileId;
  })();

  catalogFileUploads.set(fileName, upload);
  upload.catch(() => catalogFileUploads.delete(fileName));
  return upload;
}

export async function startCoordinatedLookTask(input: {
  feature: CoordinatedLookFeature;
  sourceFileId: string;
  referencePath: string;
  garmentCategory?: "upper_body" | "lower_body" | "full_body";
  gender?: "female" | "male";
}) {
  const referenceFileId = await uploadCatalogReference(input.referencePath);
  const body = input.feature === "clothing"
    ? { src_file_id: input.sourceFileId, ref_file_id: referenceFileId, garment_category: input.garmentCategory }
    : input.feature === "shoes"
      ? { src_file_id: input.sourceFileId, ref_file_id: referenceFileId, gender: input.gender, style: "style_minimalist" }
      : { src_file_id: input.sourceFileId, ref_file_ids: [referenceFileId] };

  const payload = await requestPerfectCorp(TASK_URLS[input.feature], coordinatedLookStartSchema, {
    method: "POST",
    body: JSON.stringify(body),
  });
  return payload.data.task_id;
}

export async function getCoordinatedLookTask(feature: CoordinatedLookFeature, taskId: string): Promise<CoordinatedLookTaskState> {
  const payload = await requestPerfectCorp(`${TASK_URLS[feature]}/${encodeURIComponent(taskId)}`, coordinatedLookTaskSchema, { method: "GET" });
  if (payload.data.task_status === "error") {
    throw new PerfectCorpError(payload.data.error_message || (typeof payload.data.error === "string" ? payload.data.error : "The virtual try-on could not be completed."), 422);
  }
  if (payload.data.task_status !== "success") return { status: "running" };
  if (!payload.data.results?.url) throw new PerfectCorpError("The completed virtual try-on contained no image.");
  return { status: "success", resultUrl: payload.data.results.url };
}
