import type { LookTemplate, LookTryOnTaskState } from "./look-vto.types";

async function readJson<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload
      ? String(payload.error)
      : "The makeup preview could not be created.";
    throw new Error(message);
  }
  return payload as T;
}

export async function fetchLookTemplates(signal?: AbortSignal) {
  const response = await fetch("/api/look-vto/templates", { signal, cache: "no-store" });
  return readJson<{ templates: LookTemplate[] }>(response);
}

export async function startLookTryOn(fileId: string, templateId: string, signal?: AbortSignal) {
  const response = await fetch("/api/look-vto/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileId, templateId }),
    signal,
  });
  return readJson<{ taskId: string; pollToken: string }>(response);
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      window.clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    };
    const timeout = window.setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, ms);
    signal.addEventListener("abort", onAbort, { once: true });
  });
}

export async function pollLookTryOn(
  taskId: string,
  pollToken: string,
  signal: AbortSignal,
  onAttempt?: (attempt: number) => void
) {
  for (let attempt = 1; attempt <= 80; attempt++) {
    onAttempt?.(attempt);
    const response = await fetch(
      `/api/look-vto/tasks/${encodeURIComponent(taskId)}?token=${encodeURIComponent(pollToken)}`,
      { signal, cache: "no-store" }
    );
    const state = await readJson<LookTryOnTaskState>(response);
    if (state.status === "success") return state.resultUrl;
    await sleep(attempt < 4 ? 2500 : 5000, signal);
  }
  throw new Error("The makeup preview took too long. Please try again.");
}
