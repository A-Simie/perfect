import { NextResponse } from "next/server";
import { createUploadReservation } from "@/lib/beauty-profile/beauty-profile.service";
import { getBeautyProfileUser } from "@/lib/beauty-profile/beauty-profile.server";
import { uploadMetadataSchema } from "@/lib/beauty-profile/beauty-profile.validation";
import { beautyProfileErrorResponse } from "../route-utils";

export async function POST(request: Request) {
  if (!(await getBeautyProfileUser())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const input = uploadMetadataSchema.safeParse(
    await request.json().catch(() => null)
  );

  if (!input.success) {
    return NextResponse.json(
      { error: "Please choose a JPEG or PNG image no larger than 10 MB." },
      { status: 400 }
    );
  }

  try {
    return NextResponse.json(await createUploadReservation(input.data));
  } catch (error) {
    return beautyProfileErrorResponse(error);
  }
}
