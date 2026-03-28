import { NextResponse } from "next/server";
import promptpay from "promptpay-qr";
import QRCode from "qrcode";
import Booking from "@/models/Booking";
import Payment from "@/models/Payment"; 
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

export async function POST(req: Request) {
  await connectDB();

  const { bookingId } = await req.json();

  if (!bookingId) {
    return NextResponse.json({ error: "กรุณาระบุ bookingId" }, { status: 400 });
  }

  const booking = await Booking.findOne({ bookingId });

  if (!booking) {
    return NextResponse.json({ error: "ไม่พบข้อมูลการจอง" }, { status: 404 });
  }

  const course = await Course.findById(booking.courseId);

  if (!course) {
    return NextResponse.json({ error: "ไม่พบข้อมูลคอร์ส" }, { status: 404 });
  }

  const payment = await Payment.findOneAndUpdate(
    { bookingId: booking._id },
    {
      $setOnInsert: {
        paymentId: "PAY_" + Date.now(),
        amount: course.price,
        paymentStatus: "waiting_payment"
      }
    },
    {
      new: true,
      upsert: true
    }
  );

  const payload = promptpay(process.env.PROMPTPAY_NUMBER!, {
    amount: payment.amount 
  });

  const qr = await QRCode.toDataURL(payload);

  return NextResponse.json({ qr });
}