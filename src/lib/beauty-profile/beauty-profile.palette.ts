import { PALETTE_RULES_VERSION } from "./beauty-profile.constants";
import type {
  BeautyPalette,
  PaletteContrast,
  PaletteDirection,
} from "./beauty-profile.types";

type Rgb = { red: number; green: number; blue: number };

const palettes: Record<PaletteDirection, Omit<BeautyPalette, "rulesVersion" | "contrast" | "paletteTags">> = {
  warm: {
    direction: "warm",
    title: "Warm, grounded color",
    description: "Earthy richness and softly golden color will coordinate naturally with your detected tones.",
    clothingColors: [
      { name: "Oxblood", hex: "#6F263D" },
      { name: "Olive", hex: "#667052" },
      { name: "Camel", hex: "#B8895B" },
      { name: "Warm ivory", hex: "#F4E8D5" },
      { name: "Terracotta", hex: "#B85C46" },
    ],
    makeup: {
      lips: ["Spiced rose", "Brick red", "Caramel nude"],
      cheeks: ["Warm peach", "Burnished coral"],
      eyes: ["Bronze", "Olive", "Chocolate brown"],
    },
  },
  cool: {
    direction: "cool",
    title: "Cool, refined color",
    description: "Blue-based shades and polished jewel tones will echo the cooler balance in your detected colors.",
    clothingColors: [
      { name: "Berry", hex: "#7A3154" },
      { name: "Slate blue", hex: "#536785" },
      { name: "Pine", hex: "#315C55" },
      { name: "Soft white", hex: "#F4F1F3" },
      { name: "Plum", hex: "#59405F" },
    ],
    makeup: {
      lips: ["Blue red", "Berry rose", "Mauve nude"],
      cheeks: ["Cool rose", "Soft plum"],
      eyes: ["Taupe", "Slate", "Deep plum"],
    },
  },
  neutral: {
    direction: "neutral",
    title: "Balanced, versatile color",
    description: "Balanced neutrals with selective warm or cool accents will work easily across your wardrobe and makeup.",
    clothingColors: [
      { name: "Burgundy", hex: "#713748" },
      { name: "Sage", hex: "#77836B" },
      { name: "Mushroom", hex: "#9A887C" },
      { name: "Cream", hex: "#F2E9DC" },
      { name: "Dusty rose", hex: "#B8797F" },
    ],
    makeup: {
      lips: ["Rosewood", "Balanced red", "Pink beige"],
      cheeks: ["Muted rose", "Neutral peach"],
      eyes: ["Soft brown", "Pewter", "Muted bronze"],
    },
  },
};

function toRgb(hex: string): Rgb {
  const normalized = hex.replace("#", "");
  const value = /^[0-9a-f]{6}$/i.test(normalized) ? normalized : "808080";
  return {
    red: Number.parseInt(value.slice(0, 2), 16),
    green: Number.parseInt(value.slice(2, 4), 16),
    blue: Number.parseInt(value.slice(4, 6), 16),
  };
}

function luminance(color: Rgb) {
  return color.red * 0.2126 + color.green * 0.7152 + color.blue * 0.0722;
}

function getDirection(skinColor: string, lipColor: string): PaletteDirection {
  const skin = toRgb(skinColor);
  const lip = toRgb(lipColor);
  const warmth = skin.red - skin.blue + (skin.green - skin.blue) * 0.45;
  const lipCoolness = lip.blue - lip.green;

  if (warmth >= 42 && lipCoolness < 18) return "warm";
  if (warmth <= 24 || lipCoolness >= 28) return "cool";
  return "neutral";
}

function getContrast(skinColor: string, hairColor: string, eyeColor: string): PaletteContrast {
  const skinLightness = luminance(toRgb(skinColor));
  const featureLightness = (luminance(toRgb(hairColor)) + luminance(toRgb(eyeColor))) / 2;
  const difference = Math.abs(skinLightness - featureLightness);
  if (difference < 42) return "soft";
  if (difference > 92) return "deep";
  return "balanced";
}

export function createBeautyPalette(input: {
  skinColor: string;
  eyeColor: string;
  lipColor: string;
  hairColor: string;
}): BeautyPalette {
  const direction = getDirection(input.skinColor, input.lipColor);
  const contrast = getContrast(input.skinColor, input.hairColor, input.eyeColor);
  return {
    ...palettes[direction],
    rulesVersion: PALETTE_RULES_VERSION,
    contrast,
    paletteTags: [direction, contrast],
  };
}
