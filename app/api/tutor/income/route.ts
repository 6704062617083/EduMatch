import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Payment from "@/models/Payment";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ message: "Not logged in" }, { status: 401 });
    }

    const payments = await Payment.find({
      tutorId: userId,
      paymentStatus: "transferred_to_tutor"
    })
      .populate({
        path: "bookingId",
        populate: {
          path: "courseId",
          model: "Course"
        }
      })
      .sort({ createdAt: -1 });

    const formatted = payments.map((p: any) => ({
      id: p._id,
      amount: p.amount,
      createdAt: p.createdAt,
      courseName: p.bookingId?.courseId?.title || "ไม่ระบุคอร์ส"
    }));

    const totalIncome = formatted.reduce(
      (sum, p) => sum + p.amount,
      0
    );

    return NextResponse.json({
      totalIncome,
      payments: formatted
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}