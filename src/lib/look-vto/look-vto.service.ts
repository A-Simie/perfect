import "server-only";

import { PerfectCorpError, requestPerfectCorp } from "@/lib/beauty-profile/beauty-profile.service";
import type { LookTemplate, LookTryOnTaskState } from "./look-vto.types";
import { lookStartTaskSchema, lookTaskSchema, lookTemplateListSchema } from "./look-vto.validation";

const TEMPLATE_API_URL = "https://yce-api-01.makeupar.com/s2s/v2.0/task/template/look-vto";
const TASK_API_URL = "https://yce-api-01.makeupar.com/s2s/v2.0/task/look-vto";
const BEAUTY_CATEGORIES = new Set([
  "Daily",
  "Makeup Artist",
  "Work",
  "Spring",
  "Summer",
  "Wedding",
  "Ever After Beauty Collection",
]);

let templateCache: { expiresAt: number; templates: LookTemplate[] } | null = null;

export async function getLookTemplates(): Promise<LookTemplate[]> {
  if (templateCache && templateCache.expiresAt > Date.now()) return templateCache.templates;

  const templates: LookTemplate[] = [];
  let startingToken: string | number | null = null;
  for (let page = 0; page < 20 && templates.length < 10; page++) {
    const query = new URLSearchParams({ page_size: "20" });
    if (startingToken !== null) query.set("starting_token", String(startingToken));
    const payload = await requestPerfectCorp(
      `${TEMPLATE_API_URL}?${query.toString()}`,
      lookTemplateListSchema,
      { method: "GET" }
    );

    templates.push(...payload.data.templates
      .filter((template) => BEAUTY_CATEGORIES.has(template.category_name))
      .map((template) => ({
        id: template.id,
        title: template.title,
        categoryName: template.category_name,
        thumbnailUrl: template.thumb,
      })));
    startingToken = payload.data.next_token ?? null;
    if (startingToken === null) break;
  }

  templateCache = { expiresAt: Date.now() + 10 * 60 * 1000, templates: templates.slice(0, 20) };
  return templateCache.templates;
}

export async function startLookTryOn(fileId: string, templateId: string) {
  const payload = await requestPerfectCorp(TASK_API_URL, lookStartTaskSchema, {
    method: "POST",
    body: JSON.stringify({ src_file_id: fileId, template_id: templateId }),
  });
  return payload.data.task_id;
}

export async function getLookTryOnTask(taskId: string): Promise<LookTryOnTaskState> {
  const payload = await requestPerfectCorp(
    `${TASK_API_URL}/${encodeURIComponent(taskId)}`,
    lookTaskSchema,
    { method: "GET" }
  );

  if (payload.data.task_status === "error") {
    throw new PerfectCorpError(
      payload.data.error_message ||
        (typeof payload.data.error === "string" ? payload.data.error : "The makeup look could not be applied."),
      422
    );
  }
  if (payload.data.task_status !== "success") return { status: "running" };
  if (!payload.data.results?.url) throw new PerfectCorpError("The completed makeup look contained no image.");
  return { status: "success", resultUrl: payload.data.results.url };
}
