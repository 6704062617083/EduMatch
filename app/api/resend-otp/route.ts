import { NextResponse } from "next/server";
import { sendOTP } from "@/lib/mailer";
import { otpStore } from "../register/route";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const record = otpStore[email];

    //CHECK EMAIL EXIST 
    if (!record) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลการสมัคร" },
        { status: 400 }
      );
    }

    //GENERATE NEW OTP 
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();

    record.otp = newOtp;
    record.expiresAt = Date.now() + 5 * 60 * 1000;

    //SEND OTP AGAIN 
    await sendOTP(email, newOtp);

    return NextResponse.json(
      { message: "ส่ง OTP ใหม่แล้ว" },
      { status: 200 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { message: "Server error: " + error.message },
      { status: 500 }
    );
  }
}