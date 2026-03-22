import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  const cookieStore = await cookies();
  const role = cookieStore.get("role")?.value;

  if (role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const fileUrl = searchParams.get("url");

  if (!fileUrl) {
    return NextResponse.json({ error: "No URL" }, { status: 400 });
  }

  if (!fileUrl.startsWith("https://res.cloudinary.com/")) {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const response = await fetch(fileUrl);
  console.log("status:", response.status);
  console.log("content-type:", response.headers.get("content-type"));
  const buffer = await response.arrayBuffer();
  console.log("buffer size:", buffer.byteLength);

  const filename = decodeURIComponent(fileUrl.split("/").pop() || "file");
  const ext = filename.split(".").pop()?.toLowerCase();

  const mimeMap: Record<string, string> = {
    pdf:  "application/pdf",
    png:  "image/png",
    jpg:  "image/jpeg",
    jpeg: "image/jpeg",
    webp: "image/webp",
  };

  const contentType = mimeMap[ext ?? ""] || "application/octet-stream";

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `inline; filename="${filename}"`,
    },
  });
}