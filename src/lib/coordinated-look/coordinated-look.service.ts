import "server-only";

import { PerfectCorpError, requestPerfectCorp } from "@/lib/beauty-profile/beauty-profile.service";
import type { CoordinatedLookFeature, CoordinatedLookTaskState } from "./coordinated-look.types";
import { coordinatedLookStartSchema, coordinatedLookTaskSchema } from "./coordinated-look.validation";

const TASK_URLS: Record<CoordinatedLookFeature, string> = {
  clothing: "https://yce-api-01.makeupar.com/s2s/v2.0/task/cloth-v4",
  shoes: "https://yce-api-01.makeupar.com/s2s/v2.0/task/shoes",
  necklace: "https://yce-api-01.makeupar.com/s2s/v2.0/task/2d-vto/necklace",
};

export async function startCoordinatedLookTask(input: {
  feature: CoordinatedLookFeature;
  sourceFileId: string;
  referenceUrl: string;
  garmentCategory?: "upper_body" | "lower_body" | "full_body";
  gender?: "female" | "male";
}) {
  const body = input.feature === "clothing"
    ? { src_file_id: input.sourceFileId, ref_file_url: input.referenceUrl, garment_category: input.garmentCategory }
    : input.feature === "shoes"
      ? { src_file_id: input.sourceFileId, ref_file_url: input.referenceUrl, gender: input.gender, style: "style_minimalist" }
      : { src_file_id: input.sourceFileId, ref_file_urls: [input.referenceUrl] };

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
