import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Payment from "@/models/Payment";
import TutorWallet from "@/models/TutorWallet";
import VerificationDocument from "@/models/VerificationDocument";
import { NextResponse } from "next/server";

export async function GET() {
  await connectDB();

  const payments = await Payment.find({
    paymentStatus: { $in: ["slip_uploaded", "paid", "transferred_to_tutor"] }
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

  const tutorDocs = await VerificationDocument.find({
    userId: { $in: tutorIds }
  }).lean();

  const result = payments.map((p: any) => {
    const wallet = wallets.find(
      (w) =>
        w.tutorId.toString() ===
        p.bookingId?.tutorId?._id?.toString()
    );

    const doc = tutorDocs.find(
      (d) =>
        d.userId.toString() ===
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
      wallet: wallet || null,
      tutorQr: doc?.paymentQrUrl || null
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
    booking.paymentStatus = "paid";
    await booking.save();
  }

  if (action === "reject") {
    payment.paymentStatus = "reject";
    payment.slipUrl = undefined;
    await payment.save();

    booking.bookingStatus = "waiting_payment";
    booking.paymentStatus = "waiting_payment";
    booking.slipUrl = undefined;
    await booking.save();
  }

  if (action === "transfer") {
    if (payment.paymentStatus !== "paid") {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    payment.paymentStatus = "transferred_to_tutor";
    await payment.save();
  }

  return NextResponse.json({
    _id: payment._id.toString(),
    bookingId: booking.bookingId,
    paymentStatus: payment.paymentStatus,
    price: payment.amount,
    slipUrl: payment.slipUrl,
  });
}