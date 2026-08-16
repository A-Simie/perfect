export type PaletteDirection = "warm" | "cool" | "neutral";
export type PaletteContrast = "soft" | "balanced" | "deep";

export type BeautyPalette = {
  rulesVersion: string;
  direction: PaletteDirection;
  contrast: PaletteContrast;
  title: string;
  description: string;
  paletteTags: string[];
  clothingColors: Array<{ name: string; hex: string }>;
  makeup: {
    lips: string[];
    cheeks: string[];
    eyes: string[];
  };
};

export type BeautyColorProfile = {
  skinColor: string;
  eyeColor: string;
  eyeColorName: string;
  lipColor: string;
  eyebrowColor: string;
  hairColor: string;
  hairColorName: string;
  palette: BeautyPalette;
};

export type UploadReservation = {
  fileId: string;
  upload: {
    method: string;
    url: string;
    headers: Record<string, string>;
  };
};

export type BeautyProfileTaskState =
  | { status: "running" }
  | { status: "success"; result: BeautyColorProfile };

export type BeautyProfileWorkflowStage =
  | "idle"
  | "validating"
  | "uploading"
  | "starting"
  | "processing"
  | "success"
  | "error";
