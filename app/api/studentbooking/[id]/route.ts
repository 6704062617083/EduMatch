import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";

export async function PATCH(
  req: NextRequest,
  context: any
) {
  try {
    await connectDB();

    const { id } = context.params;
    const body = await req.json();

    if (!body.status) {
      return NextResponse.json(
        { message: "status is required" },
        { status: 400 }
      );
    }

    const updated = await Booking.findOneAndUpdate(
      { bookingId: id },
      { bookingStatus: body.status },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error" }, { status: 500 });
  }
}