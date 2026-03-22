import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import VerificationDocument from "@/models/VerificationDocument";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const doc = await VerificationDocument.findOne({ userId });

    if (!doc) {
      return NextResponse.json(null); // ยังไม่เคยส่ง
    }

    return NextResponse.json(doc);

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}