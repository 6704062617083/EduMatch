import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import { sendOTP } from "@/lib/mailer";
import { registerOtpStore } from "@/lib/otpStore";

export const otpStore: Record<string, { otp: string; data: any; expiresAt: number }> = {};

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, surname, phone, email, password, role } = await req.json();

    if (!name || !surname || !phone || !email || !password || !role) {
      return NextResponse.json(
        { message: "กรอกข้อมูลให้ครบ" },
        { status: 400 }
      );
    }

    const phoneReg = /^\+[1-9]\d{7,14}$/;
    if (!phoneReg.test(phone)) {
      return NextResponse.json(
        { message: "รูปแบบเบอร์โทรไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email นี้ถูกใช้แล้ว" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    registerOtpStore[email] = {
      otp,
      data: {
        name,
        surname,
        phone,
        email,
        password: hashedPassword,
        role,
      },
      expiresAt: Date.now() + 5 * 60 * 1000,
    };

    await sendOTP(email, otp);

    return NextResponse.json(
      { message: "ส่ง OTP ไปที่อีเมลแล้ว กรุณาตรวจสอบ", email },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server Error: " + error.message },
      { status: 500 }
    );
  }
}