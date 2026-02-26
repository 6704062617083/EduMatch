import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { name, surname, phone, email, password, role } =
      await req.json();

    // เช็คกรอกครบไหม
    if (!name || !surname || !phone || !email || !password || !role) {
      return NextResponse.json(
        { message: "กรอกข้อมูลให้ครบ" },
        { status: 400 }
      );
    }

    // เช็ค email ซ้ำ
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email นี้ถูกใช้แล้ว" },
        { status: 400 }
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // บันทึกลง DB
    await User.create({
      name,
      surname,
      phone,
      email,
      password: hashedPassword,
      role,
    });

    return NextResponse.json(
      { message: "สมัครสมาชิกสำเร็จ!" },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { message: "Server Error: " + error.message },
      { status: 500 }
    );
  }
}