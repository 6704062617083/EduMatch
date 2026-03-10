import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    await connectDB();

    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json(
        { message: "Email and password are required" },
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