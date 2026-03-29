import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";
import User from "@/models/User";
import { cookies } from "next/headers";

export async function GET() {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json([], { status: 401 });
    }

    const tickets = await SupportTicket.find({ userId })
      .sort({ createdAt: -1 });

    return NextResponse.json(tickets);
  } catch (err) {
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ message: "Not logged in" }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { subject, text } = await req.json();

    if (!subject || !text) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 });
    }

    const newTicket = await SupportTicket.create({
      userId,
      userRole: user.role,
      subject,
      messages: [
        {
          senderId: userId,
          senderRole: user.role,
          text,
        },
      ],
    });

    return NextResponse.json(newTicket);
  } catch (err: any) {
    return NextResponse.json(
      { message: "Error: " + err.message },
      { status: 500 }
    );
  }
}