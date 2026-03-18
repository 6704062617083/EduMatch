import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const studentId = req.nextUrl.searchParams.get("studentId");

    if (!studentId) {
      return NextResponse.json(
        { message: "studentId is required" },
        { status: 400 }
      );
    }

    const bookings = await Booking.find({ studentId })
      .sort({ createdAt: -1 });

    const result = [];

    for (const booking of bookings) {
      const course = await Course.findById(booking.courseId);

      result.push({
        bookingId: booking.bookingId,

        courseTitle: course?.title || "",
        startTime: course?.startTime,
        endTime: course?.endTime,
        price: course?.price,

        status: booking.bookingStatus,
        createdAt: booking.createdAt
      });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("GET STUDENT BOOKINGS ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}