import { NextResponse } from "next/server";
import { getBeautyProfileUser } from "@/lib/beauty-profile/beauty-profile.server";
import { getLookTemplates } from "@/lib/look-vto/look-vto.service";
import { lookVtoErrorResponse } from "../route-utils";

export async function GET() {
  if (!(await getBeautyProfileUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    return NextResponse.json(
      { templates: await getLookTemplates() },
      { headers: { "Cache-Control": "private, max-age=300" } }
    );
  } catch (error) {
    return lookVtoErrorResponse(error);
  }
}
