import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import VerificationDocument from "@/models/VerificationDocument";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const doc = await VerificationDocument.create({
      ...body,
      status: "pending",
    });

    return NextResponse.json(
      { message: "ส่งเอกสารสำเร็จ", data: doc },
      { status: 201 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { message: "error: " + error.message },
      { status: 500 }
    );
  }
}