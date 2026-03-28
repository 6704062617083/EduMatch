import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { bookingId } = await req.json();

    if (!bookingId) {
      return NextResponse.json(
        { error: "bookingId is required" },
        { status: 400 }
      );
    }

    const booking = await Booking.findOne({ bookingId });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.bookingStatus === "completed") {
      return NextResponse.json(
        { error: "Cannot cancel completed booking" },
        { status: 400 }
      );
    }

    if (booking.bookingStatus === "cancelled") {
      return NextResponse.json(
        { error: "Already cancelled" },
        { status: 400 }
      );
    }

    booking.bookingStatus = "cancelled";
    await booking.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}