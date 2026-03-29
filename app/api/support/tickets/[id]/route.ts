import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import SupportTicket from "@/models/SupportTicket";
import User from "@/models/User";
import { cookies } from "next/headers";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
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

    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ message: "No message" }, { status: 400 });
    }

    const ticket = await SupportTicket.findById(params.id);
    if (!ticket) {
      return NextResponse.json({ message: "Ticket not found" }, { status: 404 });
    }

    ticket.messages.push({
      senderId: userId,
      senderRole: user.role,
      text,
      createdAt: new Date(),
    });

    await ticket.save();

    return NextResponse.json(ticket);
  } catch (err: any) {
    return NextResponse.json(
      { message: "Error: " + err.message },
      { status: 500 }
    );
  }
}