export type LookTemplate = {
  id: string;
  title: string;
  categoryName: string;
  thumbnailUrl: string;
};

export type LookTryOnTaskState =
  | { status: "running" }
  | { status: "success"; resultUrl: string };
