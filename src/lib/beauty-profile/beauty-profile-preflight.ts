import type { BlazeFaceModel, NormalizedFace } from "@tensorflow-models/blazeface";

export type BeautyProfilePreflightCheck = {
  id: "face" | "framing" | "position" | "lighting" | "sharpness";
  label: string;
  detail: string;
  status: "pass" | "warn" | "fail";
};

export type BeautyProfilePreflightResult = {
  status: "ready" | "error";
  guidance: string;
  faceDetected: boolean;
  faceCoverage: number | null;
  faceBounds: { x: number; y: number; width: number; height: number } | null;
  brightness: number;
  contrast: number;
  sharpness: number;
  checks: BeautyProfilePreflightCheck[];
};

let modelPromise: Promise<BlazeFaceModel> | null = null;

async function getFaceModel() {
  if (!modelPromise) {
    modelPromise = Promise.all([
      import("@tensorflow/tfjs"),
      import("@tensorflow-models/blazeface"),
    ]).then(([, blazeFace]) =>
      blazeFace.load({ maxFaces: 2, scoreThreshold: 0.75 })
    );
  }
  return modelPromise;
}

function buildCanvas(source: CanvasImageSource, width: number, height: number) {
  const scale = Math.min(1, 640 / Math.max(width, height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("This browser could not inspect the photo.");
  context.drawImage(source, 0, 0, canvas.width, canvas.height);
  return { canvas, context };
}

function measureImage(context: CanvasRenderingContext2D, width: number, height: number) {
  const { data } = context.getImageData(0, 0, width, height);
  const luminance = new Float32Array(width * height);
  let sum = 0;

  for (let pixel = 0, index = 0; pixel < data.length; pixel += 4, index += 1) {
    const value = data[pixel] * 0.2126 + data[pixel + 1] * 0.7152 + data[pixel + 2] * 0.0722;
    luminance[index] = value;
    sum += value;
  }

  const brightness = sum / luminance.length;
  let variance = 0;
  let edgeSum = 0;
  let edgeCount = 0;

  for (let y = 1; y < height - 1; y += 1) {
    for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      const delta = luminance[index] - brightness;
      variance += delta * delta;
      edgeSum += Math.abs(
        luminance[index - 1] + luminance[index + 1] +
          luminance[index - width] + luminance[index + width] - 4 * luminance[index]
      );
      edgeCount += 1;
    }
  }

  return {
    brightness,
    contrast: Math.sqrt(variance / Math.max(1, (width - 2) * (height - 2))),
    sharpness: edgeSum / Math.max(1, edgeCount),
  };
}

function point(value: NormalizedFace["topLeft"]) {
  return Array.isArray(value) ? value : Array.from(value.dataSync());
}

function isFacingForward(face: NormalizedFace, faceWidth: number) {
  if (!face.landmarks || !Array.isArray(face.landmarks)) return true;
  const [rightEye, leftEye, nose] = face.landmarks;
  if (!rightEye || !leftEye || !nose) return true;
  const eyeMidpoint = (rightEye[0] + leftEye[0]) / 2;
  const eyeLevelDifference = Math.abs(rightEye[1] - leftEye[1]);
  return Math.abs(nose[0] - eyeMidpoint) <= faceWidth * 0.16 && eyeLevelDifference <= faceWidth * 0.13;
}

function faceChecks(faces: NormalizedFace[], width: number, height: number) {
  const checks: BeautyProfilePreflightCheck[] = [];
  if (faces.length === 0) {
    checks.push({ id: "face", label: "One visible face", detail: "No face found. Look directly at the camera.", status: "fail" });
    return { checks, faceCoverage: null, faceBounds: null };
  }
  if (faces.length > 1) {
    checks.push({ id: "face", label: "One visible face", detail: "Only one person should be in the photo.", status: "fail" });
    return { checks, faceCoverage: null, faceBounds: null };
  }

  const face = faces[0];
  const topLeft = point(face.topLeft);
  const bottomRight = point(face.bottomRight);
  const faceWidth = bottomRight[0] - topLeft[0];
  const faceHeight = bottomRight[1] - topLeft[1];
  const faceCoverage = faceWidth / width;
  const centerX = (topLeft[0] + faceWidth / 2) / width;
  const centerY = (topLeft[1] + faceHeight / 2) / height;
  const centered = Math.abs(centerX - 0.5) <= 0.18 && centerY >= 0.28 && centerY <= 0.68;
  const forward = isFacingForward(face, faceWidth);

  checks.push({ id: "face", label: "One visible face", detail: "Face detected.", status: "pass" });
  checks.push({
    id: "framing",
    label: "Face fills the frame",
    detail:
      faceCoverage < 0.38
        ? "A little closer would improve the crop; we will prepare it automatically."
        : faceCoverage > 0.92
          ? "Move back slightly so your forehead and chin remain visible."
          : `Distance is good (${Math.round(faceCoverage * 100)}% of the frame).`,
      status: faceCoverage >= 0.28 && faceCoverage <= 0.96 ? "pass" : "warn",
  });
  checks.push({
    id: "position",
    label: "Face is straight and centered",
    detail: !centered ? "Centering can be improved; the image will be centered automatically." : !forward ? "A straight-on pose is recommended." : "Position looks good.",
    status: centered && forward ? "pass" : "warn",
  });
  return {
    checks,
    faceCoverage,
    faceBounds: {
      x: topLeft[0] / width,
      y: topLeft[1] / height,
      width: faceWidth / width,
      height: faceHeight / height,
    },
  };
}

export async function inspectBeautyProfileImage(
  source: CanvasImageSource,
  width: number,
  height: number
): Promise<BeautyProfilePreflightResult> {
  const { canvas, context } = buildCanvas(source, width, height);
  const metrics = measureImage(context, canvas.width, canvas.height);
  const model = await getFaceModel();
  const faces = await model.estimateFaces(canvas, false, false, true);
  const { checks, faceCoverage, faceBounds } = faceChecks(faces, canvas.width, canvas.height);

  const lightingPass = metrics.brightness >= 35 && metrics.brightness <= 230;
  checks.push({
    id: "lighting",
    label: "Even, clear lighting",
    detail:
      metrics.brightness < 72
        ? "Lighting is too dark. Face a window or soft lamp."
        : metrics.brightness > 195
          ? "Lighting is too bright. Step away from direct light."
          : metrics.contrast < 18
            ? "The light is flat or hazy. More even light is recommended."
            : "Lighting looks good.",
    status: lightingPass ? (metrics.contrast >= 18 ? "pass" : "warn") : "fail",
  });

  const sharpnessPass = metrics.sharpness >= 2;
  checks.push({
    id: "sharpness",
    label: "Photo is in focus",
    detail: sharpnessPass ? "Image detail looks clear." : "A steadier photo would improve detail.",
    status: sharpnessPass ? "pass" : "warn",
  });

  const failedCheck = checks.find((check) => check.status === "fail");
  const warningCheck = checks.find((check) => check.status === "warn");
  return {
    status: failedCheck ? "error" : "ready",
    guidance: failedCheck?.detail ?? warningCheck?.detail ?? "Perfect. Hold still.",
    faceDetected: faces.length === 1,
    faceCoverage,
    faceBounds,
    ...metrics,
    checks,
  };
}

function loadImage(file: File) {
  const objectUrl = URL.createObjectURL(file);
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("We could not inspect that image."));
    };
    image.src = objectUrl;
  });
}

export async function normalizeBeautyProfileFile(file: File, result: BeautyProfilePreflightResult) {
  if (!result.faceBounds) return file;

  const image = await loadImage(file);
  const face = result.faceBounds;
  const faceWidth = face.width * image.naturalWidth;
  const faceHeight = face.height * image.naturalHeight;
  let cropWidth = Math.min(image.naturalWidth, faceWidth / 0.72);
  let cropHeight = cropWidth * 1.25;

  if (cropHeight > image.naturalHeight) {
    cropHeight = image.naturalHeight;
    cropWidth = cropHeight / 1.25;
  }

  const faceCenterX = (face.x + face.width / 2) * image.naturalWidth;
  const faceCenterY = (face.y + face.height / 2) * image.naturalHeight;
  const cropX = Math.min(Math.max(0, faceCenterX - cropWidth / 2), image.naturalWidth - cropWidth);
  const cropY = Math.min(
    Math.max(0, faceCenterY - cropHeight / 2 - faceHeight * 0.03),
    image.naturalHeight - cropHeight
  );

  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 1200;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser could not prepare the photo.");
  context.drawImage(image, cropX, cropY, cropWidth, cropHeight, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.94));
  if (!blob) throw new Error("This browser could not prepare the photo.");
  return new File([blob], file.name.replace(/\.(png|jpe?g)$/i, "") + "-prepared.jpg", {
    type: "image/jpeg",
  });
}

export async function inspectBeautyProfileFile(file: File) {
  const image = await loadImage(file);
  return inspectBeautyProfileImage(image, image.naturalWidth, image.naturalHeight);
}
