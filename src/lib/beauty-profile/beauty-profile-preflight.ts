import type { BlazeFaceModel, NormalizedFace } from "@tensorflow-models/blazeface";
import type { FaceLandmarksDetector, Keypoint } from "@tensorflow-models/face-landmarks-detection";

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
  faceLandmarks: {
    screenLeftEye: { x: number; y: number };
    screenRightEye: { x: number; y: number };
    screenLeftEyebrow?: { x: number; y: number };
    screenRightEyebrow?: { x: number; y: number };
    screenLeftCheek?: { x: number; y: number };
    screenRightCheek?: { x: number; y: number };
    nose: { x: number; y: number };
    mouth: { x: number; y: number };
  } | null;
  brightness: number;
  contrast: number;
  sharpness: number;
  checks: BeautyProfilePreflightCheck[];
};

let modelPromise: Promise<BlazeFaceModel> | null = null;
let faceMeshPromise: Promise<FaceLandmarksDetector> | null = null;

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

async function getFaceMesh() {
  if (!faceMeshPromise) {
    faceMeshPromise = Promise.all([
      import("@tensorflow/tfjs"),
      import("@tensorflow-models/face-landmarks-detection/dist/tfjs/detector"),
    ]).then(([, faceMesh]) =>
      faceMesh.load({ runtime: "tfjs", maxFaces: 1, refineLandmarks: true })
    );
  }
  return faceMeshPromise;
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
    return { checks, faceCoverage: null, faceBounds: null, faceLandmarks: null };
  }
  if (faces.length > 1) {
    checks.push({ id: "face", label: "One visible face", detail: "Only one person should be in the photo.", status: "fail" });
    return { checks, faceCoverage: null, faceBounds: null, faceLandmarks: null };
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
  const landmarks = Array.isArray(face.landmarks) ? face.landmarks : null;
  const normalizedLandmark = (landmark: number[] | undefined) =>
    landmark ? { x: landmark[0] / width, y: landmark[1] / height } : null;
  const [rightEye, leftEye, nose, mouth] = landmarks ?? [];
  const eyes = [normalizedLandmark(rightEye), normalizedLandmark(leftEye)]
    .filter((eye): eye is { x: number; y: number } => Boolean(eye))
    .sort((first, second) => first.x - second.x);
  const normalizedLandmarks = {
    screenLeftEye: eyes[0] ?? null,
    screenRightEye: eyes[1] ?? null,
    nose: normalizedLandmark(nose),
    mouth: normalizedLandmark(mouth),
  };
  const faceLandmarks = Object.values(normalizedLandmarks).every(Boolean)
    ? normalizedLandmarks as BeautyProfilePreflightResult["faceLandmarks"]
    : null;

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
    faceLandmarks,
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
  const { checks, faceCoverage, faceBounds, faceLandmarks } = faceChecks(faces, canvas.width, canvas.height);

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
    faceLandmarks,
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

function averageKeypoints(keypoints: Keypoint[], indices: number[], width: number, height: number) {
  const points = indices.map((index) => keypoints[index]).filter(Boolean);
  if (points.length === 0) return null;
  const total = points.reduce(
    (sum, keypoint) => ({ x: sum.x + keypoint.x, y: sum.y + keypoint.y }),
    { x: 0, y: 0 }
  );
  return { x: total.x / points.length / width, y: total.y / points.length / height };
}

export async function refineBeautyProfileLandmarks(
  file: File,
  result: BeautyProfilePreflightResult
): Promise<BeautyProfilePreflightResult> {
  try {
    const image = await loadImage(file);
    const { canvas } = buildCanvas(image, image.naturalWidth, image.naturalHeight);
    const { MEDIAPIPE_FACE_MESH_KEYPOINTS_BY_CONTOUR: contours } = await import(
      "@tensorflow-models/face-landmarks-detection/dist/constants"
    );
    const detector = await getFaceMesh();
    const [face] = await detector.estimateFaces(canvas, { staticImageMode: true });
    if (!face) return result;
    const orderByX = (points: Array<{ x: number; y: number } | null>) =>
      points.filter((value): value is { x: number; y: number } => Boolean(value))
        .sort((first, second) => first.x - second.x);
    const eyes = orderByX([
      averageKeypoints(face.keypoints, contours.leftEye, canvas.width, canvas.height),
      averageKeypoints(face.keypoints, contours.rightEye, canvas.width, canvas.height),
    ]);
    const eyebrows = orderByX([
      averageKeypoints(face.keypoints, contours.leftEyebrow, canvas.width, canvas.height),
      averageKeypoints(face.keypoints, contours.rightEyebrow, canvas.width, canvas.height),
    ]);
    const cheeks = orderByX([
      averageKeypoints(face.keypoints, [205], canvas.width, canvas.height),
      averageKeypoints(face.keypoints, [425], canvas.width, canvas.height),
    ]);
    const mouth = averageKeypoints(face.keypoints, contours.lips, canvas.width, canvas.height);
    const nose = averageKeypoints(face.keypoints, [1], canvas.width, canvas.height);
    if (eyes.length !== 2 || eyebrows.length !== 2 || cheeks.length !== 2 || !mouth || !nose) return result;

    return {
      ...result,
      faceLandmarks: {
        screenLeftEye: eyes[0],
        screenRightEye: eyes[1],
        screenLeftEyebrow: eyebrows[0],
        screenRightEyebrow: eyebrows[1],
        screenLeftCheek: cheeks[0],
        screenRightCheek: cheeks[1],
        mouth,
        nose,
      },
    };
  } catch {
    return result;
  }
}

export type HairColorEstimate = {
  color: string;
  name: string;
  anchor: { x: number; y: number };
};

function hairColorName(red: number, green: number, blue: number) {
  const brightness = red * 0.2126 + green * 0.7152 + blue * 0.0722;
  const spread = Math.max(red, green, blue) - Math.min(red, green, blue);
  if (brightness < 52) return "Black";
  if (spread < 20 && brightness > 145) return "Grey/White";
  if (red > green * 1.22 && red > blue * 1.3) return brightness > 105 ? "Red" : "Auburn";
  if (brightness > 145 && red > blue + 12) return "Blonde";
  return "Brown";
}

export async function estimateHairColor(
  file: File,
  result: BeautyProfilePreflightResult
): Promise<HairColorEstimate | null> {
  if (!result.faceBounds) return null;
  const image = await loadImage(file);
  const { canvas, context } = buildCanvas(image, image.naturalWidth, image.naturalHeight);
  const face = result.faceBounds;
  const left = Math.max(0, Math.round((face.x + face.width * 0.16) * canvas.width));
  const right = Math.min(canvas.width, Math.round((face.x + face.width * 0.84) * canvas.width));
  // Keep the sample above the forehead so skin pixels do not pull the hair result downward.
  const top = Math.max(0, Math.round((face.y - face.height * 0.34) * canvas.height));
  const bottom = Math.min(canvas.height, Math.round((face.y - face.height * 0.015) * canvas.height));
  if (right <= left || bottom <= top) return null;

  const { data } = context.getImageData(left, top, right - left, bottom - top);
  const regionWidth = right - left;
  const pixels: Array<{ red: number; green: number; blue: number; brightness: number; x: number; y: number }> = [];
  for (let index = 0; index < data.length; index += 16) {
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const brightness = red * 0.2126 + green * 0.7152 + blue * 0.0722;
    const pixelIndex = index / 4;
    if (brightness < 245) {
      pixels.push({
        red,
        green,
        blue,
        brightness,
        x: left + pixelIndex % regionWidth,
        y: top + Math.floor(pixelIndex / regionWidth),
      });
    }
  }
  if (pixels.length < 20) return null;

  pixels.sort((a, b) => a.brightness - b.brightness);
  const selected = pixels.slice(0, Math.max(20, Math.round(pixels.length * 0.62)));
  const average = selected.reduce(
    (total, pixel) => ({
      red: total.red + pixel.red,
      green: total.green + pixel.green,
      blue: total.blue + pixel.blue,
      x: total.x + pixel.x,
      y: total.y + pixel.y,
    }),
    { red: 0, green: 0, blue: 0, x: 0, y: 0 }
  );
  const red = Math.round(average.red / selected.length);
  const green = Math.round(average.green / selected.length);
  const blue = Math.round(average.blue / selected.length);
  const color = `#${[red, green, blue].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  return {
    color,
    name: hairColorName(red, green, blue),
    anchor: {
      x: average.x / selected.length / canvas.width,
      y: average.y / selected.length / canvas.height,
    },
  };
}
