import { NextResponse } from "next/server";
import { getBeautyProfileUser } from "@/lib/beauty-profile/beauty-profile.server";
import { verifyTaskPollToken } from "@/lib/beauty-profile/beauty-profile.service";
import { getCoordinatedLookTask } from "@/lib/coordinated-look/coordinated-look.service";
import { coordinatedLookFeatureSchema } from "@/lib/coordinated-look/coordinated-look.validation";
import { coordinatedLookErrorResponse } from "../../../route-utils";

export async function GET(request: Request, { params }: { params: Promise<{ feature: string; taskId: string }> }) {
  const user = await getBeautyProfileUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { feature: rawFeature, taskId } = await params;
  const feature = coordinatedLookFeatureSchema.safeParse(rawFeature);
  const token = new URL(request.url).searchParams.get("token");
  if (!feature.success || !taskId || taskId.length > 500 || !token || !verifyTaskPollToken(user.id, taskId, token)) return NextResponse.json({ error: "Invalid task reference." }, { status: 400 });
  try {
    return NextResponse.json(await getCoordinatedLookTask(feature.data, taskId), { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return coordinatedLookErrorResponse(error);
  }
}
