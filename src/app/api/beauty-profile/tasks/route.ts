import { NextResponse } from "next/server";
import { getBeautyProfileUser } from "@/lib/beauty-profile/beauty-profile.server";
import {
  createTaskPollToken,
  startBeautyProfile,
} from "@/lib/beauty-profile/beauty-profile.service";
import { startTaskSchema } from "@/lib/beauty-profile/beauty-profile.validation";
import { beautyProfileErrorResponse } from "../route-utils";

export async function POST(request: Request) {
  const user = await getBeautyProfileUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const input = startTaskSchema.safeParse(
    await request.json().catch(() => null)
  );

  if (!input.success) {
    return NextResponse.json({ error: "Invalid file reference." }, { status: 400 });
  }

  try {
    const taskId = await startBeautyProfile(input.data.fileId);
    return NextResponse.json({
      taskId,
      pollToken: createTaskPollToken(user.id, taskId),
    });
  } catch (error) {
    return beautyProfileErrorResponse(error);
  }
}
