export type CoordinatedLookFeature = "clothing" | "shoes" | "necklace";

export type CoordinatedLookTaskState =
  | { status: "running" }
  | { status: "success"; resultUrl: string };

export type CoordinatedLookTask = { taskId: string; pollToken: string };
