import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "กรอกข้อมูลให้ครบ" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "ไม่พบผู้ใช้นี้" },
        { status: 400 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "รหัสผ่านไม่ถูกต้อง" },
        { status: 400 }
      );
    }

    const response = NextResponse.json(
      {
        message: "ล็อกอินสำเร็จ",
        role: user.role,
        userId: user._id,
        name: user.name,
        surname: user.surname,
      },
      { status: 200 }
    );
    
    response.cookies.set("role", user.role, {
      httpOnly: true,
      path: "/",
    });

    response.cookies.set("userId", user._id.toString(), {
      httpOnly: true,
      path: "/",
    });

    response.cookies.set("name", user.name, {
      path: "/",
    });

    response.cookies.set("surname", user.surname, {
      path: "/",
    });

    return response;

  } catch (error: any) {
    return NextResponse.json(
      { message: "Server Error: " + error.message },
      { status: 500 }
    );
  }
}