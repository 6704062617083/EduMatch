import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

// ต้อง import otpStore จาก register
import { otpStore } from "../register/route";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, otp } = await req.json();

    const record = otpStore[email];

    //CHECK OTP EXIST
    if (!record) {
      return NextResponse.json(
        { message: "ไม่พบ OTP" },
        { status: 400 }
      );
    }

    //CHECK OTP EXPIRE
    if (Date.now() > record.expiresAt) {
      delete otpStore[email];
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
    delete otpStore[email];

    return NextResponse.json(
      { message: "สมัครสมาชิกสำเร็จ" },
      { status: 201 }
    );

  } catch (error: any) {
    return NextResponse.json(
      { message: "Server error " + error.message },
      { status: 500 }
    );
  }
}