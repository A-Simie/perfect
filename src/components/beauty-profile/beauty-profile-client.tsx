"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Camera,
  Check,
  FileImage,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  pollBeautyProfile,
  reserveBeautyProfileUpload,
  startBeautyProfile,
  uploadBeautyProfileFile,
  validateBeautyProfileFile,
} from "@/lib/beauty-profile/beauty-profile.client";
import {
  estimateHairColor,
  inspectBeautyProfileFile,
  normalizeBeautyProfileFile,
  refineBeautyProfileLandmarks,
  type BeautyProfilePreflightResult,
  type HairColorEstimate,
} from "@/lib/beauty-profile/beauty-profile-preflight";
import { createBeautyPalette } from "@/lib/beauty-profile/beauty-profile.palette";
import type {
  BeautyColorProfile,
  BeautyProfileWorkflowStage,
} from "@/lib/beauty-profile/beauty-profile.types";
import { BeautyProfileCamera } from "./beauty-profile-camera";
import { BeautyProfilePreflight } from "./beauty-profile-preflight";
import { BeautyProfileProcessing } from "./beauty-profile-processing";

type Props = { firstName: string };

const stageCopy: Record<
  Exclude<BeautyProfileWorkflowStage, "idle" | "success" | "error">,
  { label: string; detail: string }
> = {
  validating: { label: "Checking your photo", detail: "Making sure the image is ready." },
  uploading: { label: "Preparing your profile", detail: "Uploading your photo securely." },
  starting: { label: "Reading your colors", detail: "Setting up your color profile." },
  processing: { label: "Building your palette", detail: "This usually takes less than a minute." },
};

function ColorSwatch({ label, color, detail }: { label: string; color: string; detail?: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 border-b border-[var(--line)] py-2.5">
      <span className="h-9 w-9 shrink-0 rounded-full border border-black/10" style={{ backgroundColor: color }} />
      <span className="min-w-0">
        <strong className="block text-xs font-semibold text-[var(--ink)]">{label}</strong>
        <span className="block truncate text-[11px] text-[var(--muted-ink)]">{detail || color.toUpperCase()}</span>
      </span>
    </div>
  );
}

function colorDistance(first: string, second: string) {
  const channels = (color: string) => {
    const value = color.replace("#", "");
    return [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16));
  };
  const [firstRed, firstGreen, firstBlue] = channels(first);
  const [secondRed, secondGreen, secondBlue] = channels(second);
  return Math.hypot(firstRed - secondRed, firstGreen - secondGreen, firstBlue - secondBlue);
}

function reconcileHairColor(result: BeautyColorProfile, estimate: HairColorEstimate | null) {
  if (!estimate || colorDistance(result.hairColor, estimate.color) < 95) return result;
  const corrected = {
    ...result,
    hairColor: estimate.color,
    hairColorName: estimate.name,
    hairColorSource: "photo-cross-check" as const,
  };
  return {
    ...corrected,
    palette: createBeautyPalette(corrected),
  };
}

function AnnotatedPortrait({
  portraitUrl,
  result,
  faceBounds,
  faceLandmarks,
  hairAnchor,
}: {
  portraitUrl: string | null;
  result: BeautyColorProfile;
  faceBounds: BeautyProfilePreflightResult["faceBounds"];
  faceLandmarks: BeautyProfilePreflightResult["faceLandmarks"];
  hairAnchor: HairColorEstimate["anchor"] | null;
}) {
  const face = faceBounds ?? { x: 0.18, y: 0.12, width: 0.64, height: 0.72 };
  const point = (x: number, y: number) => ({
    x: Math.max(3, Math.min(97, x * 100)),
    y: Math.max(3, Math.min(97, y * 100)),
  });
  const screenLeftEye = faceLandmarks?.screenLeftEye ?? { x: face.x + face.width * 0.3, y: face.y + face.height * 0.36 };
  const screenRightEye = faceLandmarks?.screenRightEye ?? { x: face.x + face.width * 0.68, y: face.y + face.height * 0.36 };
  const screenRightEyebrow = faceLandmarks?.screenRightEyebrow ?? { x: screenRightEye.x, y: screenRightEye.y - face.height * 0.1 };
  const screenLeftCheek = faceLandmarks?.screenLeftCheek ?? { x: screenLeftEye.x - face.width * 0.12, y: screenLeftEye.y + face.height * 0.16 };
  const mouth = faceLandmarks?.mouth ?? { x: face.x + face.width * 0.5, y: face.y + face.height * 0.73 };
  const callouts = [
    { label: "Hair color", color: result.hairColor, detail: result.hairColorName, side: "left", labelClass: "left-2 top-[10%]", start: { x: 27, y: 15 }, anchor: point(hairAnchor?.x ?? face.x + face.width * 0.5, hairAnchor?.y ?? face.y - face.height * 0.12) },
    { label: "Eyebrow color", color: result.eyebrowColor, side: "right", labelClass: "right-2 top-[22%]", start: { x: 73, y: 27 }, anchor: point(screenRightEyebrow.x, screenRightEyebrow.y) },
    { label: "Eye color", color: result.eyeColor, detail: result.eyeColorName, side: "left", labelClass: "left-2 top-[40%]", start: { x: 27, y: 45 }, anchor: point(screenLeftEye.x, screenLeftEye.y) },
    { label: "Lip color", color: result.lipColor, side: "right", labelClass: "right-2 top-[59%]", start: { x: 73, y: 64 }, anchor: point(mouth.x, mouth.y) },
    { label: "Skin tone", color: result.skinColor, side: "left", labelClass: "left-2 bottom-[13%]", start: { x: 27, y: 82 }, anchor: point(screenLeftCheek.x, screenLeftCheek.y) },
  ];

  return (
    <div role="img" aria-label="Your analyzed portrait with detected color callouts" className="relative aspect-[4/5] overflow-hidden rounded-[8px] bg-[var(--surface-container-high)]">
      {portraitUrl ? (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${JSON.stringify(portraitUrl).slice(1, -1)})` }} />
      ) : (
        <div className="absolute inset-0 grid place-items-center text-sm text-[var(--muted-ink)]">Portrait unavailable</div>
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-black/45 via-transparent to-black/35" />
      <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {callouts.map((callout) => {
          return (
            <g key={callout.label}>
              <path d={`M ${callout.start.x} ${callout.start.y} L ${callout.anchor.x} ${callout.anchor.y}`} fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth="0.35" />
              <circle cx={callout.anchor.x} cy={callout.anchor.y} r="1.2" fill="rgba(20,16,16,0.38)" stroke="white" strokeWidth="0.45" />
            </g>
          );
        })}
      </svg>
      {callouts.map((callout) => (
        <div key={callout.label} className={`absolute ${callout.labelClass} max-w-[42%] text-[10px] font-semibold uppercase leading-tight tracking-[0.08em] text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] sm:text-[11px]`}>
          <span className="mr-1.5 inline-block h-3.5 w-3.5 rounded-full border-2 border-white align-[-2px]" style={{ backgroundColor: callout.color }} />
          {callout.label}
          {callout.detail && <span className="mt-1 block pl-5 text-[9px] font-normal normal-case tracking-normal text-white/80">{callout.detail}</span>}
        </div>
      ))}
    </div>
  );
}

function ResultsView({
  result,
  portraitUrl,
  faceBounds,
  faceLandmarks,
  hairAnchor,
  onReset,
}: {
  result: BeautyColorProfile;
  portraitUrl: string | null;
  faceBounds: BeautyProfilePreflightResult["faceBounds"];
  faceLandmarks: BeautyProfilePreflightResult["faceLandmarks"];
  hairAnchor: HairColorEstimate["anchor"] | null;
  onReset: () => void;
}) {
  const detectedColors = [
    { label: "Skin", color: result.skinColor },
    { label: "Eyes", color: result.eyeColor, detail: result.eyeColorName },
    { label: "Lips", color: result.lipColor },
    { label: "Brows", color: result.eyebrowColor },
    { label: "Hair", color: result.hairColor, detail: `${result.hairColorName}${result.hairColorSource === "photo-cross-check" ? " · Photo cross-check" : ""}` },
  ];

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-3 border-b border-[var(--line)] pb-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow"><Sparkles size={13} /> Your Beauty Palette</p>
          <h1 className="mt-2 font-[Georgia,serif] text-3xl font-normal tracking-[-0.04em] text-[var(--burgundy)] sm:text-4xl">
            {result.palette.title}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--muted-ink)]">{result.palette.description}</p>
        </div>
        <button type="button" onClick={onReset} className="button-outline w-fit"><RefreshCw size={14} /> New photo</button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(18rem,27rem)_minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="mx-auto w-full max-w-[27rem] lg:mx-0">
          <AnnotatedPortrait portraitUrl={portraitUrl} result={result} faceBounds={faceBounds} faceLandmarks={faceLandmarks} hairAnchor={hairAnchor} />
          <div className="mt-3 flex flex-wrap gap-2">
            {result.palette.paletteTags.map((tag) => (
              <span key={tag} className="rounded-full bg-[var(--sage-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--sage-ink)]">{tag}</span>
            ))}
          </div>
        </div>

        <div>
          <p className="eyebrow">Colors detected</p>
          <div className="mt-2">{detectedColors.map((item) => <ColorSwatch key={item.label} {...item} />)}</div>
        </div>

        <div className="min-w-0 border-t border-[var(--line)] pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
          <p className="eyebrow">Your coordinated direction</p>
          <div className="mt-4 flex flex-wrap gap-2" aria-label="Recommended clothing colors">
            {result.palette.clothingColors.map((color) => (
              <div key={color.name} className="w-[calc(33.333%-0.35rem)] min-w-20">
                <div className="h-12 rounded-[6px] border border-black/10" style={{ backgroundColor: color.hex }} />
                <p className="mt-1.5 text-[10px] font-medium text-[var(--muted-ink)]">{color.name}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {Object.entries(result.palette.makeup).map(([area, shades]) => (
              <div key={area} className="border-t border-[var(--line)] pt-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--burgundy)]">{area}</p>
                <p className="mt-1 text-xs leading-5 text-[var(--muted-ink)]">{shades.join(" · ")}</p>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between gap-4 rounded-[8px] bg-[var(--surface-container-low)] p-4">
            <div>
              <p className="text-xs font-semibold text-[var(--ink)]">Next: see the palette on your face</p>
              <p className="mt-1 text-[11px] text-[var(--muted-ink)]">Look Virtual Try-On is the next integration slice.</p>
            </div>
            <ArrowRight size={18} className="shrink-0 text-[var(--burgundy)]" />
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-t border-[var(--line)] pt-4 text-[11px] leading-5 text-[var(--muted-ink)]">
        <ShieldCheck size={16} className="mt-0.5 shrink-0 text-[var(--sage-ink)]" />
        <p>Your profile is a styling guide derived from detected colors, not a health or skincare assessment. The original photo is not saved by Perfection in this release.</p>
      </div>
    </section>
  );
}

export function BeautyProfileClient({ firstName }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stage, setStage] = useState<BeautyProfileWorkflowStage>("idle");
  const [stageDetail, setStageDetail] = useState("JPEG or PNG, up to 10 MB.");
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<BeautyColorProfile | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [fileSource, setFileSource] = useState<"camera" | "upload" | null>(null);
  const [preflight, setPreflight] = useState<BeautyProfilePreflightResult | null>(null);
  const [hairEstimate, setHairEstimate] = useState<HairColorEstimate | null>(null);
  const [isCheckingPhoto, setIsCheckingPhoto] = useState(false);

  useEffect(() => () => {
    abortRef.current?.abort();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const chooseFile = async (nextFile: File | undefined, source: "camera" | "upload" = "upload") => {
    if (!nextFile) return;
    setCameraOpen(false);
    setStage("validating");
    setPreflight(null);
    setHairEstimate(null);
    setIsCheckingPhoto(true);
    const validationError = await validateBeautyProfileFile(nextFile);
    if (validationError) {
      setFile(null);
      setFileSource(null);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
      setStage("idle");
      toast.error(validationError);
      setIsCheckingPhoto(false);
      return;
    }

    try {
      const initialPreflight = await inspectBeautyProfileFile(nextFile);
      const preparedFile = source === "camera" ? nextFile : await normalizeBeautyProfileFile(nextFile, initialPreflight);
      const inspectedPreflight = preparedFile === nextFile
        ? initialPreflight
        : await inspectBeautyProfileFile(preparedFile);
      const nextPreflight = await refineBeautyProfileLandmarks(preparedFile, inspectedPreflight);
      const nextHairEstimate = await estimateHairColor(preparedFile, nextPreflight);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setFile(preparedFile);
      setFileSource(source);
      setPreviewUrl(URL.createObjectURL(preparedFile));
      setPreflight(nextPreflight);
      setHairEstimate(nextHairEstimate);
      if (nextPreflight.status === "error") toast.error(nextPreflight.guidance);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not inspect that image.");
    } finally {
      setStage("idle");
      setStageDetail("Ready when you are.");
      setIsCheckingPhoto(false);
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setCameraOpen(false);
    setFileSource(null);
    setPreflight(null);
    setHairEstimate(null);
    setAttempt(0);
    setStage("idle");
    setStageDetail("JPEG or PNG, up to 10 MB.");
    if (inputRef.current) inputRef.current.value = "";
  };

  const createProfile = async () => {
    if (!file || preflight?.status !== "ready") return;
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      setStage("uploading");
      setStageDetail(stageCopy.uploading.detail);
      const reservation = await reserveBeautyProfileUpload(file);
      await uploadBeautyProfileFile(file, reservation);
      setStage("starting");
      setStageDetail(stageCopy.starting.detail);
      const { taskId, pollToken } = await startBeautyProfile(reservation.fileId);
      setStage("processing");
      setStageDetail(stageCopy.processing.detail);
      const providerResult = await pollBeautyProfile(taskId, pollToken, controller.signal, setAttempt);
      setResult(reconcileHairColor(providerResult, hairEstimate));
      setStage("success");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setStage("error");
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      abortRef.current = null;
    }
  };

  if (stage === "success" && result) {
    return <ResultsView result={result} portraitUrl={previewUrl} faceBounds={preflight?.faceBounds ?? null} faceLandmarks={preflight?.faceLandmarks ?? null} hairAnchor={hairEstimate?.anchor ?? null} onReset={reset} />;
  }

  const isWorking = ["validating", "uploading", "starting", "processing"].includes(stage);
  const workingCopy = stageCopy[stage as keyof typeof stageCopy];
  const isReady = file && preflight?.status === "ready";

  return (
    <section className="grid min-h-[calc(100vh-8.5rem)] min-w-0 content-center gap-6 overflow-hidden lg:grid-cols-[minmax(19rem,25rem)_minmax(22rem,1fr)] lg:items-center lg:gap-12">
      <div className="min-w-0">
        <p className="eyebrow"><Sparkles size={13} /> Beauty Profile / step 01</p>
        <h1 className="mt-3 font-[Georgia,serif] text-4xl font-normal tracking-[-0.04em] text-[var(--burgundy)] sm:text-5xl">
          Find the colors that feel like you, {firstName}.
        </h1>
        <p className="mt-4 max-w-lg text-sm leading-6 text-[var(--muted-ink)]">
          One clear portrait gives Perfection the color foundation for coordinated makeup, clothing, and accessories.
        </p>

        <div className="mt-6">
          {isWorking ? (
            <div className="border-l-2 border-[var(--sage-ink)] pl-4">
              <div className="flex items-center gap-3 text-[var(--burgundy)]"><LoaderCircle size={19} className="animate-spin" /><h2 className="font-[Georgia,serif] text-xl">{workingCopy?.label}</h2></div>
              <p className="mt-2 text-sm text-[var(--muted-ink)]">{stageDetail}</p>
              {stage === "processing" && <p className="mt-2 text-[11px] text-[var(--muted-ink)]">Status checks: {attempt}</p>}
            </div>
          ) : preflight || isCheckingPhoto ? (
            <div>
              <p className="eyebrow">Photo readiness</p>
              <div className="mt-3"><BeautyProfilePreflight result={preflight} checking={isCheckingPhoto} /></div>
            </div>
          ) : (
            <ul className="space-y-2.5 text-sm leading-5 text-[var(--muted-ink)]">
              <li className="flex gap-3"><Check size={16} className="mt-0.5 shrink-0 text-[var(--sage-ink)]" /> Face the camera with your full face visible.</li>
              <li className="flex gap-3"><Check size={16} className="mt-0.5 shrink-0 text-[var(--sage-ink)]" /> Use soft, even daylight and avoid color filters.</li>
              <li className="flex gap-3"><Check size={16} className="mt-0.5 shrink-0 text-[var(--sage-ink)]" /> Keep heavy makeup and tinted glasses off for the best color read.</li>
            </ul>
          )}
        </div>
      </div>

      <div className="mx-auto w-full max-w-[34rem] min-w-0 border border-[var(--line)] bg-[var(--paper)] p-3 lg:mx-0">
        <div
          className="relative overflow-hidden rounded-[8px] bg-[var(--surface-container)]"
          onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => { event.preventDefault(); setIsDragging(false); void chooseFile(event.dataTransfer.files[0]); }}
        >
          {cameraOpen ? (
            <BeautyProfileCamera onClose={() => setCameraOpen(false)} onCapture={(captured) => void chooseFile(captured, "camera")} />
          ) : previewUrl ? (
            <div className="relative aspect-[4/3] bg-[var(--surface-container-high)]">
              <div className="absolute inset-0 bg-contain bg-center bg-no-repeat" style={{ backgroundImage: `url(${JSON.stringify(previewUrl).slice(1, -1)})` }} />
              {!isWorking && (
                <div className="absolute bottom-3 right-3 flex gap-2">
                  <button type="button" onClick={() => setCameraOpen(true)} className="rounded-full bg-[rgba(255,255,255,0.92)] px-3 py-2 text-xs font-semibold text-[var(--ink)] shadow-sm hover:bg-[var(--surface-container-low)]"><Camera size={14} className="mr-1 inline" />{fileSource === "camera" ? "Retake" : "Camera"}</button>
                  <button type="button" onClick={() => inputRef.current?.click()} className="rounded-full bg-[rgba(255,255,255,0.92)] px-3 py-2 text-xs font-semibold text-[var(--ink)] shadow-sm hover:bg-[var(--surface-container-low)]"><Upload size={14} className="mr-1 inline" />Replace</button>
                </div>
              )}
              {isWorking && <BeautyProfileProcessing label={workingCopy?.label ?? "Creating profile"} />}
            </div>
          ) : (
            <div className={`flex aspect-[4/3] flex-col items-center justify-center border-2 border-dashed px-5 text-center ${isDragging ? "border-[var(--burgundy)] bg-[var(--blush)]/25" : "border-[var(--outline-variant)]"}`}>
              <p className="eyebrow">Add one clear portrait</p>
              <div className="mt-5 grid w-full max-w-sm gap-3 sm:grid-cols-2">
                <button type="button" onClick={() => setCameraOpen(true)} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-[8px] border border-[var(--outline-variant)] bg-[var(--paper)] px-4 hover:border-[var(--burgundy)] hover:bg-[var(--surface-container-low)]"><Camera size={20} /><strong className="text-xs">Take a photo</strong></button>
                <button type="button" onClick={() => inputRef.current?.click()} className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-[8px] border border-[var(--outline-variant)] bg-[var(--paper)] px-4 hover:border-[var(--burgundy)] hover:bg-[var(--surface-container-low)]"><Upload size={20} /><strong className="text-xs">Upload a photo</strong></button>
              </div>
              <p className="mt-3 text-[10px] text-[var(--muted-ink)]">JPEG or PNG · up to 10 MB · drag and drop supported</p>
            </div>
          )}
          <input ref={inputRef} type="file" accept="image/jpeg,image/png" className="sr-only" onChange={(event) => void chooseFile(event.target.files?.[0])} />
        </div>

        <div className="flex min-h-14 items-center justify-between gap-4 px-1 pt-3">
          <span className="flex min-w-0 items-center gap-2 text-xs text-[var(--muted-ink)]">
            {file ? <FileImage size={15} className="shrink-0 text-[var(--sage-ink)]" /> : <LockKeyhole size={14} className="shrink-0" />}
            <span className="truncate">{file?.name ?? "Your photo is sent securely and is not stored here."}</span>
          </span>
          {file && !isWorking && <button type="button" onClick={reset} className="shrink-0 text-xs font-semibold text-[var(--burgundy)] hover:underline">Remove</button>}
        </div>
        <button type="button" onClick={() => void createProfile()} disabled={!isReady || isWorking} className="button-dark w-full disabled:cursor-not-allowed disabled:opacity-40">
          Create my Beauty Palette <ArrowRight size={15} />
        </button>
      </div>
    </section>
  );
}
