import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

import { registerOtpStore, forgotOtpStore } from "@/lib/otpStore";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, otp, type } = await req.json();

    if (type === "register") {

      const record = registerOtpStore[email];

      //CHECK OTP EXIST
      if (!record) {
        return NextResponse.json(
          { message: "ไม่พบ OTP" },
          { status: 400 }
        );
      }

      //CHECK OTP EXPIRE
      if (Date.now() > record.expiresAt) {
        delete registerOtpStore[email];
        return NextResponse.json(
          { message: "OTP หมดอายุ" },
          { status: 400 }
        );
      }

      //CHECK OTP MATCH
      if (record.otp !== otp) {
        return NextResponse.json(
          { message: "OTP ไม่ถูกต้อง" },
          { status: 400 }
        );
      }

      //CREATE USER
      await User.create(record.data);

      //ลบ OTP หลังใช้
      delete registerOtpStore[email];

      return NextResponse.json(
        { message: "สมัครสมาชิกสำเร็จ" },
        { status: 201 }
      );
    }

    if (type === "forgot") {

      const record = forgotOtpStore[email];

      //CHECK OTP EXIST
      if (!record) {
        return NextResponse.json(
          { message: "ไม่พบ OTP" },
          { status: 400 }
        );
      }

      //CHECK OTP EXPIRE
      if (Date.now() > record.expiresAt) {
        delete forgotOtpStore[email];
        return NextResponse.json(
          { message: "OTP หมดอายุ" },
          { status: 400 }
        );
      }

      //CHECK OTP MATCH
      if (record.otp !== otp) {
        return NextResponse.json(
          { message: "OTP ไม่ถูกต้อง" },
          { status: 400 }
        );
      }

      //ลบ OTP หลังใช้
      delete forgotOtpStore[email];

      return NextResponse.json(
        { message: "OTP ถูกต้อง" },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "ประเภท OTP ไม่ถูกต้อง" },
      { status: 400 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { message: "Server error " + error.message },
      { status: 500 }
    );
  }
}