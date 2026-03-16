import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Course from "@/models/Course";
import User from "@/models/User";
import Counter from "@/models/Counter";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { studentId, courseId } = body;

    if (!studentId || !courseId) {
      return NextResponse.json(
        { message: "studentId and courseId required" },
        { status: 400 }
      );
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return NextResponse.json(
        { message: "Course not found" },
        { status: 404 }
      );
    }

    const existing = await Booking.findOne({
      studentId,
      courseId,
      bookingStatus: { $ne: "cancelled" }
    });

    if (existing) {
      return NextResponse.json(
        { message: "Already booked this course" },
        { status: 400 }
      );
    }

    const counter = await Counter.findOneAndUpdate(
      { name: "booking" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const bookingId = "BK" + String(counter.seq).padStart(5, "0");

    const booking = await Booking.create({
      bookingId,
      studentId,
      tutorId: course.tutorId,
      courseId,
      bookingStatus: "pending"
    });

    return NextResponse.json(booking, { status: 201 });

  } catch (error) {
    console.error("CREATE BOOKING ERROR:", error);
    return NextResponse.json(
      { message: "Create booking failed" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const tutorId = req.nextUrl.searchParams.get("tutorId");

    if (!tutorId) {
      return NextResponse.json([]);
    }

    const bookings = await Booking.find({
      tutorId,
      bookingStatus: "pending"
    }).sort({ createdAt: -1 });

    const result = [];

    for (const booking of bookings) {
      const course = await Course.findById(booking.courseId);
      const student = await User.findById(booking.studentId);

      result.push({
        bookingId: booking.bookingId,
        studentName: student?.name || "Unknown",

        courseTitle: course?.title || "",
        startTime: course?.startTime,
        endTime: course?.endTime,
        price: course?.price,

        createdAt: booking.createdAt
      });
    }

    return NextResponse.json(result);

  } catch (error) {
    console.error("GET BOOKING REQUEST ERROR:", error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}