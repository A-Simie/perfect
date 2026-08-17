import { NextResponse } from "next/server";
import { getBeautyProfileUser } from "@/lib/beauty-profile/beauty-profile.server";
import { createTaskPollToken } from "@/lib/beauty-profile/beauty-profile.service";
import { startCoordinatedLookTask } from "@/lib/coordinated-look/coordinated-look.service";
import { startCoordinatedLookTaskSchema } from "@/lib/coordinated-look/coordinated-look.validation";
import { coordinatedLookErrorResponse } from "../route-utils";

function publicBaseUrl(request: Request) {
  const host = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  return host ? `https://${host}` : new URL(request.url).origin;
}

export async function POST(request: Request) {
  const user = await getBeautyProfileUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const input = startCoordinatedLookTaskSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ error: "Choose a valid try-on option." }, { status: 400 });

  const { feature, sourceFileId, garmentCategory, gender, itemIndex } = input.data;
  if (feature === "clothing" && !garmentCategory) return NextResponse.json({ error: "Choose a clothing area." }, { status: 400 });
  if (feature === "shoes" && !gender) return NextResponse.json({ error: "Choose a shoe presentation." }, { status: 400 });
  const suffix = String(itemIndex).padStart(2, "0");
  const referencePath = feature === "clothing" ? `/catalog/outfit-${garmentCategory?.replace("_body", "")}-${suffix}.jpg` : feature === "shoes" ? `/catalog/shoes-${suffix}.jpg` : `/catalog/necklace-${suffix}.jpg`;

  try {
    const taskId = await startCoordinatedLookTask({ feature, sourceFileId, referenceUrl: `${publicBaseUrl(request)}${referencePath}`, garmentCategory, gender });
    return NextResponse.json({ taskId, pollToken: createTaskPollToken(user.id, taskId) });
  } catch (error) {
    return coordinatedLookErrorResponse(error);
  }
}
