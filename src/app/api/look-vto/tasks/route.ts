import { NextResponse } from "next/server";
import { createTaskPollToken } from "@/lib/beauty-profile/beauty-profile.service";
import { getBeautyProfileUser } from "@/lib/beauty-profile/beauty-profile.server";
import { startLookTryOn } from "@/lib/look-vto/look-vto.service";
import { startLookTaskInputSchema } from "@/lib/look-vto/look-vto.validation";
import { lookVtoErrorResponse } from "../route-utils";

export async function POST(request: Request) {
  const user = await getBeautyProfileUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const input = startLookTaskInputSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) {
    return NextResponse.json({ error: "Choose a valid makeup look." }, { status: 400 });
  }

  try {
    const taskId = await startLookTryOn(input.data.fileId, input.data.templateId);
    return NextResponse.json({
      taskId,
      pollToken: createTaskPollToken(user.id, taskId),
    });
  } catch (error) {
    return lookVtoErrorResponse(error);
  }
}
