import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { forgotOtpStore } from "@/lib/otpStore";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, newPassword, otp } = await req.json();

    if (!email || !newPassword || !otp) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    const record = forgotOtpStore[email];

    if (!record) {
      return NextResponse.json(
        { message: "กรุณากดส่ง OTP ก่อน" },
        { status: 400 }
      );
    }

    if (Date.now() > record.expiresAt) {
      delete forgotOtpStore[email];
      return NextResponse.json(
        { message: "OTP หมดอายุ" },
        { status: 400 }
      );
    }

    if (record.otp !== otp) {
      return NextResponse.json(
        { message: "OTP ไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Email not found" },
        { status: 404 }
      );
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    delete forgotOtpStore[email];

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}