import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Tutor from "@/models/Tutor";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ message: "Not logged in" }, { status: 401 });
    }

    const tutor = await Tutor.findOne({ userId });

    if (!tutor) {
      return NextResponse.json({ message: "Tutor not found" }, { status: 404 });
    }

    return NextResponse.json({
      avgRating: tutor.avgRating,
      totalReviews: tutor.totalReviews,
    });

  } catch (error: any) {
    return NextResponse.json(
      { message: "Error: " + error.message },
      { status: 500 }
    );
  }
}