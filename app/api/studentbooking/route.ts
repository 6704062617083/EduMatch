import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Course from "@/models/Course";
import Payment from "@/models/Payment";

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

    const bookings = await Booking.find({ studentId }).sort({ createdAt: -1 });

    const bookingIds = bookings.map(b => b._id);

    const payments = await Payment.find({
      bookingId: { $in: bookingIds }
    });

    const paymentMap = new Map();
    payments.forEach(p => {
      paymentMap.set(p.bookingId.toString(), p);
    });

    const result = await Promise.all(
      bookings.map(async (booking) => {
        const course = await Course.findById(booking.courseId);
        const payment = paymentMap.get(booking._id.toString());

        return {
          _id: booking._id,
          bookingId: booking.bookingId,
          tutorId: booking.tutorId,
          courseTitle: course?.title || "",
          startTime: course?.startTime,
          endTime: course?.endTime,
          price: payment?.amount || course?.price,
          classLink: course?.classLink || "",
          bookingStatus: booking.bookingStatus,
          paymentStatus: payment?.paymentStatus || "pending",
          createdAt: booking.createdAt
        };
      })
    );

    return NextResponse.json(result);

  } catch (error) {
    console.error("GET STUDENT BOOKINGS ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}