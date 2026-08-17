import { NextResponse } from "next/server";
import { verifyTaskPollToken } from "@/lib/beauty-profile/beauty-profile.service";
import { getBeautyProfileUser } from "@/lib/beauty-profile/beauty-profile.server";
import { getLookTryOnTask } from "@/lib/look-vto/look-vto.service";
import { lookVtoErrorResponse } from "../../route-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await getBeautyProfileUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { taskId } = await params;
  const pollToken = new URL(request.url).searchParams.get("token");
  if (!taskId || taskId.length > 500 || !pollToken || !verifyTaskPollToken(user.id, taskId, pollToken)) {
    return NextResponse.json({ error: "Invalid task reference." }, { status: 400 });
  }

  try {
    return NextResponse.json(await getLookTryOnTask(taskId), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return lookVtoErrorResponse(error);
  }
}
