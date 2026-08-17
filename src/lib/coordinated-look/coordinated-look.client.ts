import type { CoordinatedLookFeature, CoordinatedLookTask, CoordinatedLookTaskState } from "./coordinated-look.types";

async function readJson<T>(response: Response): Promise<T> {
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload && typeof payload === "object" && "error" in payload ? String(payload.error) : "The virtual try-on could not be completed.");
  return payload as T;
}

export async function startCoordinatedLook(input: { feature: CoordinatedLookFeature; sourceFileId: string; garmentCategory?: string; gender?: string; itemIndex?: number }, signal?: AbortSignal) {
  const response = await fetch("/api/coordinated-look/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input), signal });
  return readJson<CoordinatedLookTask>(response);
}

function sleep(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(resolve, ms);
    signal.addEventListener("abort", () => { window.clearTimeout(timeout); reject(new DOMException("Aborted", "AbortError")); }, { once: true });
  });
}

export async function pollCoordinatedLook(feature: CoordinatedLookFeature, task: CoordinatedLookTask, signal: AbortSignal, onAttempt?: (attempt: number) => void) {
  for (let attempt = 1; attempt <= 80; attempt += 1) {
    onAttempt?.(attempt);
    const response = await fetch(`/api/coordinated-look/tasks/${feature}/${encodeURIComponent(task.taskId)}?token=${encodeURIComponent(task.pollToken)}`, { signal, cache: "no-store" });
    const state = await readJson<CoordinatedLookTaskState>(response);
    if (state.status === "success") return state.resultUrl;
    await sleep(attempt < 4 ? 2500 : 5000, signal);
  }
  throw new Error("The virtual try-on took too long. Please try again.");
}
