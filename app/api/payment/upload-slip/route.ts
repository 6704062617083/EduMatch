import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Booking from "@/models/Booking";
import Payment from "@/models/Payment";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  await connectDB();

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const bookingId = formData.get("bookingId") as string;

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const upload = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "slips" },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    ).end(buffer);
  });

  const booking = await Booking.findOne({ bookingId });

  if (!booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  let payment = await Payment.findOne({ bookingId: booking._id });

  if (!payment) {
    payment = await Payment.create({
      paymentId: "PAY_" + Date.now(),
      bookingId: booking._id,
      amount: 0,
      paymentStatus: "pending"
    });
  }

  payment.slipUrl = upload.secure_url;
  payment.paymentStatus = "slip_uploaded";
  await payment.save();

  booking.bookingStatus = "waiting_payment"; 
  booking.paymentStatus = "slip_uploaded";
  booking.slipUrl = upload.secure_url;
  await booking.save();

  return NextResponse.json({ success: true });
}
