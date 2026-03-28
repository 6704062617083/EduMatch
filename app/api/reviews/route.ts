import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Review from "@/models/Review";
import Tutor from "@/models/Tutor";
import Booking from "@/models/Booking";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { bookingId, tutorId, studentId, rating, comment } = await req.json();

    if (!bookingId || !tutorId || !studentId || !rating) {
      return NextResponse.json({ error: "ข้อมูลไม่ครบ" }, { status: 400 });
    }

    const existing = await Review.findOne({ bookingId });
    if (existing) {
      return NextResponse.json({ error: "รีวิวนี้ถูกส่งไปแล้ว" }, { status: 409 });
    }

    await Review.create({
      bookingId,
      tutorId,
      studentId,
      rating,
      comment: comment ?? ""
    });

    await Booking.findOneAndUpdate({ bookingId }, { bookingStatus: "completed" });

    const allReviews = await Review.find({ tutorId });
    const totalReviews = allReviews.length;
    const avgRating =
      totalReviews > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    await Tutor.findOneAndUpdate(
      { userId: tutorId },
      { avgRating: Math.round(avgRating * 10) / 10, totalReviews },
      { upsert: true }
    );

    return NextResponse.json({ success: true, avgRating, totalReviews });

  } catch (err) {
    console.error("POST /api/reviews error:", err);
    return NextResponse.json({ error: "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}