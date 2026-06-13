import { NextResponse } from "next/server";
import { storeImage, validateImage } from "@/lib/media";
import { getCurrentDashboardUser } from "@/lib/auth/context";

export const runtime = "nodejs";

export async function POST(req: Request) {
  // Only authenticated dashboard users may upload.
  const user = await getCurrentDashboardUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Tidak ada file." }, { status: 400 });
  }

  const validationError = validateImage({ type: file.type, size: file.size });
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  try {
    const result = await storeImage(file);
    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Gagal mengunggah file.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
