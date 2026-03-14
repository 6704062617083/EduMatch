import { NextResponse } from "next/server";
import { sendOTP } from "@/lib/mailer";
import { registerOtpStore, forgotOtpStore } from "@/lib/otpStore";

export async function POST(req: Request) {
  try {
    const { email, type } = await req.json();

    //เลือก store
    const store = type === "register"
      ? registerOtpStore
      : forgotOtpStore;

    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    //ถ้าไม่มี → สร้าง
    if (!store[email]) {
      store[email] = {
        otp: newOtp,
        expiresAt: Date.now() + 5 * 60 * 1000,
      };
    } 
    //ถ้ามี → update OTP
    else {
      store[email].otp = newOtp;
      store[email].expiresAt = Date.now() + 5 * 60 * 1000;
    }

    await sendOTP(email, newOtp);

    return NextResponse.json({ message: "ส่ง OTP แล้ว" });

  } catch (error: any) {
    return NextResponse.json(
      { message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}