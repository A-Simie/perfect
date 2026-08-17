"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, CircleAlert, LoaderCircle, X } from "lucide-react";
import { inspectBeautyProfileImage, type BeautyProfilePreflightResult } from "@/lib/beauty-profile/beauty-profile-preflight";
import { BeautyProfilePreflight } from "./beauty-profile-preflight";

type Props = {
  onCapture: (file: File) => void;
  onClose: () => void;
};

type CameraState = "requesting" | "ready" | "error";

function createPhoto(video: HTMLVideoElement) {
  const canvas = document.createElement("canvas");
  const cropSize = Math.min(video.videoWidth, video.videoHeight) * 0.84;
  const cropX = (video.videoWidth - cropSize) / 2;
  const cropY = (video.videoHeight - cropSize) / 2;
  canvas.width = cropSize;
  canvas.height = cropSize;
  const context = canvas.getContext("2d");
  if (!context) return Promise.resolve<File | null>(null);
  context.save();
  context.translate(canvas.width, 0);
  context.scale(-1, 1);
  context.drawImage(video, cropX, cropY, cropSize, cropSize, 0, 0, canvas.width, canvas.height);
  context.restore();
  return new Promise<File | null>((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ? new File([blob], `perfection-selfie-${Date.now()}.jpg`, { type: "image/jpeg" }) : null),
      "image/jpeg",
      0.94
    );
  });
}

export function BeautyProfileCamera({ onCapture, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureHandlerRef = useRef(onCapture);
  const readySinceRef = useRef<number | null>(null);
  const capturedRef = useRef(false);
  const [state, setState] = useState<CameraState>("requesting");
  const [error, setError] = useState<string | null>(null);
  const [preflight, setPreflight] = useState<BeautyProfilePreflightResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    captureHandlerRef.current = onCapture;
  }, [onCapture]);

  useEffect(() => {
    let active = true;

    async function startCamera() {
      if (!navigator.mediaDevices?.getUserMedia) {
        setState("error");
        setError("Camera access is not supported in this browser. Upload a photo instead.");
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 1280 } },
        });
        if (!active) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setState("ready");
      } catch (cameraError) {
        setState("error");
        setError(
          cameraError instanceof DOMException && cameraError.name === "NotAllowedError"
            ? "Camera permission was denied. Allow camera access or upload a photo instead."
            : "The camera could not be started. Upload a photo instead."
        );
      }
    }

    void startCamera();
    return () => {
      active = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const capture = async () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || capturedRef.current) return;
    capturedRef.current = true;
    const file = await createPhoto(video);
    if (file) captureHandlerRef.current(file);
    else capturedRef.current = false;
  };

  useEffect(() => {
    if (state !== "ready") return;
    let active = true;
    let inspecting = false;

    const inspect = async () => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0 || inspecting || capturedRef.current) return;
      inspecting = true;
      setChecking(true);
      try {
        const result = await inspectBeautyProfileImage(video, video.videoWidth, video.videoHeight);
        if (!active) return;
        setPreflight(result);

        if (result.status === "ready") {
          readySinceRef.current ??= Date.now();
          const remaining = 1800 - (Date.now() - readySinceRef.current);
          setCountdown(Math.max(1, Math.ceil(remaining / 900)));
          if (remaining <= 0) void capture();
        } else {
          readySinceRef.current = null;
          setCountdown(null);
        }
      } catch {
        if (active) {
          setError("The face guide could not start. Refresh the page or upload a photo.");
          setState("error");
        }
      } finally {
        inspecting = false;
        if (active) setChecking(false);
      }
    };

    void inspect();
    const interval = window.setInterval(() => void inspect(), 400);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [state]);

  const guidance = checking && !preflight
    ? "Loading face guide..."
    : countdown
      ? `Perfect. Hold still, taking photo in ${countdown}`
      : preflight?.guidance ?? "Look straight at the camera";

  return (
    <div className="relative grid aspect-[4/3] grid-rows-[minmax(0,1fr)_auto] overflow-hidden rounded-[8px] bg-[var(--aubergine)] text-white sm:grid-cols-[minmax(0,1fr)_13rem] sm:grid-rows-1">
      <div className="flex min-h-0 min-w-0 items-center justify-center overflow-hidden">
        <div className="relative aspect-square h-full w-auto max-w-full overflow-hidden sm:h-auto sm:w-full">
          <video ref={videoRef} autoPlay muted playsInline aria-label="Front-facing camera preview" className={`h-full w-full scale-x-[-1] object-cover ${state === "ready" ? "opacity-100" : "opacity-0"}`} />

          <button type="button" onClick={onClose} aria-label="Close camera" className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/65">
            <X size={17} />
          </button>

          {state === "requesting" && <div className="absolute inset-0 grid place-items-center"><div className="text-center"><LoaderCircle className="mx-auto animate-spin" size={28} /><p className="mt-3 text-sm">Starting camera</p></div></div>}

          {state === "error" && <div className="absolute inset-0 grid place-items-center px-8 text-center"><div><CircleAlert className="mx-auto" size={28} /><p className="mt-3 text-sm leading-6">{error}</p><button type="button" onClick={onClose} className="button-light mt-5">Upload instead</button></div></div>}

          {state === "ready" && <div className={`pointer-events-none absolute inset-[8%] rounded-full border-2 transition-colors ${preflight?.status === "ready" ? "border-[#cfe6d7]" : "border-white/75"} shadow-[0_0_0_999px_rgba(0,0,0,0.14)]`} />}
        </div>
      </div>
      {state === "ready" && <aside className="flex min-h-0 flex-col justify-center gap-2.5 bg-[var(--paper)] p-3 text-[var(--ink)] sm:p-4">
        <p className="text-center text-xs font-semibold leading-4 text-[var(--burgundy)]">{guidance}</p>
        <BeautyProfilePreflight result={preflight} checking={checking && !preflight} compact />
        <button type="button" onClick={() => void capture()} disabled={preflight?.status !== "ready"} className="inline-flex h-9 w-full items-center justify-center gap-2 rounded-[6px] bg-[var(--ink)] text-[10px] font-semibold uppercase tracking-[0.08em] text-white disabled:cursor-not-allowed disabled:opacity-40">
          <Camera size={15} /> Take photo now
        </button>
      </aside>}
    </div>
  );
}
