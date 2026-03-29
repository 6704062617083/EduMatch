import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";
import User from "@/models/User";
import { cookies } from "next/headers";

export async function GET() {
  await connectDB();

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ message: "Not logged in" }, { status: 401 });
  }

  const user = await User.findById(userId);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const tickets = await SupportTicket.find()
    .populate("userId", "name surname email role")
    .sort({ createdAt: -1 });

  return NextResponse.json(tickets);
}

export async function POST(req: NextRequest) {
  await connectDB();

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ message: "Not logged in" }, { status: 401 });
  }

  const user = await User.findById(userId);
  if (!user || user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  const { ticketId, text } = await req.json();

  if (!ticketId || !text?.trim()) {
    return NextResponse.json({ message: "ข้อมูลไม่ครบ" }, { status: 400 });
  }

  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) {
    return NextResponse.json({ message: "ไม่พบ ticket" }, { status: 404 });
  }

  if (ticket.status === "closed") {
    return NextResponse.json({ message: "Ticket นี้ถูกปิดแล้ว" }, { status: 400 });
  }

  ticket.messages.push({
    senderId: user._id.toString(),
    senderRole: "admin",
    text,
    createdAt: new Date(),
  });

  await ticket.save();
  await ticket.populate("userId", "name surname email role");

  return NextResponse.json(ticket);
}