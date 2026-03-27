import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import VerificationDocument from "@/models/VerificationDocument";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const role = cookieStore.get("role")?.value;

    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await VerificationDocument.find({ status: "pending" })
      .populate("userId", "name surname email phone") 
      .sort({ createdAt: -1 });

    return NextResponse.json(data);

  } catch (err) {
    console.error("ADMIN VERIFY ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}