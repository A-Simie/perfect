import { z } from "zod";

const colorSchema = z.string().regex(/^#[0-9a-f]{6}$/i);

const beautyColorProfileSchema = z.object({
  skinColor: colorSchema,
  eyeColor: colorSchema,
  eyeColorName: z.string().min(1),
  lipColor: colorSchema,
  eyebrowColor: colorSchema,
  hairColor: colorSchema,
  hairColorName: z.string().min(1),
  hairColorSource: z.enum(["provider", "photo-cross-check"]),
  palette: z.object({
    rulesVersion: z.string().min(1),
    direction: z.enum(["warm", "cool", "neutral"]),
    contrast: z.enum(["soft", "balanced", "deep"]),
    title: z.string().min(1),
    description: z.string().min(1),
    paletteTags: z.array(z.string()),
    clothingColors: z.array(z.object({ name: z.string().min(1), hex: colorSchema })),
    makeup: z.object({
      lips: z.array(z.string()),
      cheeks: z.array(z.string()),
      eyes: z.array(z.string()),
    }),
  }),
});

const styleFlowSchema = z.object({
  sourceFileId: z.string().min(1),
  portraitDataUrl: z.string().startsWith("data:image/"),
  profile: beautyColorProfileSchema,
  makeupPreference: z.enum(["include", "skip"]),
  makeupResultUrl: z.string().url().nullable().default(null),
  clothingFocus: z.enum(["upper", "lower", "full"]).nullable().default(null),
  bodyFileId: z.string().min(1).nullable().default(null),
  bodyDataUrl: z.string().startsWith("data:image/").nullable().default(null),
  clothingResultUrl: z.string().url().nullable().default(null),
  shoesResultUrl: z.string().url().nullable().default(null),
  necklaceResultUrl: z.string().url().nullable().default(null),
  shoePresentation: z.enum(["female", "male"]).nullable().default(null),
  presentation: z.enum(["female", "male"]).nullable().default(null),
  occasion: z.enum(["wedding", "work", "evening", "casual", "formal"]).nullable().default(null),
  clothingItemIndex: z.number().int().min(1).max(10).nullable().default(null),
  shoesItemIndex: z.number().int().min(1).max(10).nullable().default(null),
  necklaceItemIndex: z.number().int().min(1).max(10).nullable().default(null),
  updatedAt: z.number(),
});

export type StyleFlowState = z.infer<typeof styleFlowSchema>;
export type MakeupPreference = StyleFlowState["makeupPreference"];
export type ClothingFocus = NonNullable<StyleFlowState["clothingFocus"]>;

const STORAGE_KEY = "perfection.style-flow.v1";

export function readStyleFlow() {
  if (typeof window === "undefined") return null;
  const value = window.sessionStorage.getItem(STORAGE_KEY);
  if (!value) return null;

  try {
    const parsed = styleFlowSchema.safeParse(JSON.parse(value));
    if (parsed.success) return parsed.data;
  } catch {
    // Invalid browser state is discarded below.
  }

  window.sessionStorage.removeItem(STORAGE_KEY);
  return null;
}

export function writeStyleFlow(state: StyleFlowState) {
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(styleFlowSchema.parse(state)));
}

export function updateStyleFlow(update: Partial<StyleFlowState>) {
  const current = readStyleFlow();
  if (!current) return null;
  const next = styleFlowSchema.parse({ ...current, ...update, updatedAt: Date.now() });
  writeStyleFlow(next);
  return next;
}
