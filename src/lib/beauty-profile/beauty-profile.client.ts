import {
  MAX_BEAUTY_PROFILE_FILE_SIZE,
  MAX_IMAGE_SIDE,
  MIN_SD_IMAGE_SIDE,
} from "./beauty-profile.constants";
import type {
  BeautyColorProfile,
  BeautyProfileTaskState,
  UploadReservation,
} from "./beauty-profile.types";

async function readResponse<T>(response: Response): Promise<T> {
  const payload: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = payload && typeof payload === "object" && "error" in payload
      ? String(payload.error)
      : "The request could not be completed.";
    throw new Error(message);
  }
  return payload as T;
}

export async function validateBeautyProfileFile(file: File) {
  if (!["image/jpeg", "image/png"].includes(file.type)) return "Choose a JPEG or PNG image.";
  if (file.size > MAX_BEAUTY_PROFILE_FILE_SIZE) return "Your image must be smaller than 10 MB.";

  const objectUrl = URL.createObjectURL(file);
  try {
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve({ width: image.width, height: image.height });
      image.onerror = () => reject(new Error("We could not read that image."));
      image.src = objectUrl;
    });
    const shortSide = Math.min(dimensions.width, dimensions.height);
    const longSide = Math.max(dimensions.width, dimensions.height);
    if (shortSide < MIN_SD_IMAGE_SIDE) return "Use a clearer photo with a short side of at least 480 pixels.";
    if (longSide > MAX_IMAGE_SIDE) return "This image is too large. Its long side must be 4096 pixels or less.";
  } catch (error) {
    return error instanceof Error ? error.message : "We could not read that image.";
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
  return null;
}

export async function reserveBeautyProfileUpload(file: File) {
  const response = await fetch("/api/beauty-profile/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName: file.name, fileSize: file.size, contentType: file.type }),
  });
  return readResponse<UploadReservation>(response);
}

export async function uploadBeautyProfileFile(file: File, reservation: UploadReservation) {
  const headers = new Headers(reservation.upload.headers);
  headers.delete("Content-Length");
  const response = await fetch(reservation.upload.url, {
    method: reservation.upload.method,
    headers,
    body: file,
  });
  if (!response.ok) throw new Error("The photo upload did not complete. Please try again.");
}

export async function startBeautyProfile(fileId: string) {
  const response = await fetch("/api/beauty-profile/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileId }),
  });
  return readResponse<{ taskId: string; pollToken: string }>(response);
}

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      window.clearTimeout(timeout);
      reject(new DOMException("Profile cancelled", "AbortError"));
    }, { once: true });
  });
}

export async function pollBeautyProfile(
  taskId: string,
  pollToken: string,
  signal: AbortSignal,
  onAttempt: (attempt: number) => void
): Promise<BeautyColorProfile> {
  for (let attempt = 1; attempt <= 120; attempt += 1) {
    onAttempt(attempt);
    const response = await fetch(
      `/api/beauty-profile/tasks/${encodeURIComponent(taskId)}?token=${encodeURIComponent(pollToken)}`,
      { signal, cache: "no-store" }
    );
    const state = await readResponse<BeautyProfileTaskState>(response);
    if (state.status === "success") return state.result;
    await wait(attempt < 4 ? 2500 : 5000, signal);
  }
  throw new Error("Your profile is taking longer than expected. Please try again.");
}
