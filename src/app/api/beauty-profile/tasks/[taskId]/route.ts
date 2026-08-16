import { NextResponse } from "next/server";
import { getBeautyProfileUser } from "@/lib/beauty-profile/beauty-profile.server";
import {
  getBeautyProfileTask,
  verifyTaskPollToken,
} from "@/lib/beauty-profile/beauty-profile.service";
import { beautyProfileErrorResponse } from "../../route-utils";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ taskId: string }> }
) {
  const user = await getBeautyProfileUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { taskId } = await params;
  const pollToken = new URL(request.url).searchParams.get("token");
  if (
    !taskId ||
    taskId.length > 500 ||
    !pollToken ||
    !verifyTaskPollToken(user.id, taskId, pollToken)
  ) {
    return NextResponse.json({ error: "Invalid task reference." }, { status: 400 });
  }

  try {
    return NextResponse.json(await getBeautyProfileTask(taskId), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    return beautyProfileErrorResponse(error);
  }
}
