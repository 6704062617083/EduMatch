import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import VerificationDocument from "@/models/VerificationDocument";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    const doc = await VerificationDocument.findOne({
      userId: id,
      status: "approved",
    })
    .populate("userId", "name surname email phone")
    .select("userId educationLevel university faculty major gpa tutorExp");

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(doc);

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}