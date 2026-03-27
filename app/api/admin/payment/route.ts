import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Payment from "@/models/Payment";
import TutorWallet from "@/models/TutorWallet";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const payments = await Payment.find({
    paymentStatus: "slip_uploaded"
  })
    .populate({
      path: "bookingId",
      populate: [
        { path: "studentId", select: "name surname" },
        { path: "tutorId", select: "name surname" },
        { path: "courseId", select: "title" }
      ]
    })
    .lean();

  const tutorIds = payments.map((p: any) =>
    p.bookingId?.tutorId?._id?.toString()
  );

  const wallets = await TutorWallet.find({
    tutorId: { $in: tutorIds }
  }).lean();

  const result = payments.map((p: any) => {
    const wallet = wallets.find(
      (w) =>
        w.tutorId.toString() ===
        p.bookingId?.tutorId?._id?.toString()
    );

    return {
      _id: p._id.toString(),
      bookingId: p.bookingId?.bookingId,
      paymentStatus: p.paymentStatus,
      price: p.amount,
      slipUrl: p.slipUrl,
      studentId: p.bookingId?.studentId,
      tutorId: p.bookingId?.tutorId,
      courseId: p.bookingId?.courseId,
      wallet: wallet || null
    };
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  await connectDB();

  const { bookingId, action } = await req.json();

  if (!bookingId || !action) {
    return NextResponse.json(
      { error: "Missing bookingId or action" },
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

  const payment = await Payment.findOne({ bookingId: booking._id });

  if (!payment) {
    return NextResponse.json(
      { error: "Payment not found" },
      { status: 404 }
    );
  }

  if (action === "approve") {
    payment.paymentStatus = "paid";
    await payment.save();

    booking.bookingStatus = "confirmed";
    await booking.save();
  }

  if (action === "reject") {
    payment.paymentStatus = "waiting_payment";
    payment.slipUrl = undefined;
    await payment.save();

    booking.bookingStatus = "waiting_payment";
    await booking.save();
  }

  return NextResponse.json({
    _id: payment._id.toString(),
    bookingId: booking.bookingId,
    paymentStatus: payment.paymentStatus,
    price: payment.amount,
    slipUrl: payment.slipUrl,
  });
}