import { NextResponse } from "next/server";
import { PerfectCorpError } from "@/lib/beauty-profile/beauty-profile.service";

export function lookVtoErrorResponse(error: unknown) {
  if (error instanceof PerfectCorpError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.status >= 400 && error.status < 600 ? error.status : 502 }
    );
  }
  return NextResponse.json({ error: "Something went wrong while creating the makeup preview." }, { status: 500 });
}
