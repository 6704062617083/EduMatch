import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Course from "@/models/Course";
import User from "@/models/User";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const tutorId = req.nextUrl.searchParams.get("tutorId");

    if (!tutorId) {
      return NextResponse.json(
        { message: "tutorId is required" },
        { status: 400 }
      );
    }

    // ดึงเฉพาะ confirmed และ completed (ไม่เอา pending/cancelled)
    const bookings = await Booking.find({
      tutorId,
      bookingStatus: { $in: ["confirmed", "completed", "waiting_payment"] },
    }).sort({ createdAt: -1 });

    const result = await Promise.all(
      bookings.map(async (booking) => {
        const course = await Course.findById(booking.courseId);
        const student = await User.findById(booking.studentId);

        return {
          bookingId: booking.bookingId,
          studentName: student?.name || "Unknown",
          courseTitle: course?.title || "",
          subject: course?.subject || "",
          startTime: course?.startTime,
          endTime: course?.endTime,
          price: course?.price,
          status: booking.bookingStatus,
          createdAt: booking.createdAt,
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("GET TUTOR SCHEDULE ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}