import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Tutor from "@/models/Tutor";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { message: "tutorId is required" },
        { status: 400 }
      );
    }

    const tutor = await Tutor.findOne({ userId: id });

    if (!tutor) {
      return NextResponse.json({
        avgRating: 0,
        totalReviews: 0,
      });
    }

    return NextResponse.json({
      avgRating: tutor.avgRating || 0,
      totalReviews: tutor.totalReviews || 0,
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: "Error: " + error.message },
      { status: 500 }
    );
  }
}