import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import TutorWallet from "@/models/TutorWallet";
import { cookies } from "next/headers";
import mongoose from "mongoose";

function sanitizeNumber(value: string) {
  return (value || "").replace(/\D/g, "").slice(0, 15);
}

export async function GET() {
  await connectDB();

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json(null);
  }

  const wallet = await TutorWallet.findOne({
    tutorId: new mongoose.Types.ObjectId(userId)
  });

  return NextResponse.json(wallet);
}

export async function POST(req: NextRequest) {
  await connectDB();

  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let { type, number, bankName } = await req.json();  // ← เพิ่ม bankName

  number = sanitizeNumber(number);

  if (!number) {
    return NextResponse.json({ message: "กรอกข้อมูล" }, { status: 400 });
  }

  if (type === "bank" && !bankName) {
    return NextResponse.json({ message: "เลือกธนาคาร" }, { status: 400 });
  }

  let accountNumber = "";
  let promptpayNumber = "";
  let savedBankName = "";

  if (type === "bank") {
    accountNumber = number;
    savedBankName = bankName;
  }

  if (type === "promptpay") {
    promptpayNumber = number;
  }

  let wallet = await TutorWallet.findOne({
    tutorId: new mongoose.Types.ObjectId(userId)
  });

  if (!wallet) {
    wallet = await TutorWallet.create({
      tutorId: new mongoose.Types.ObjectId(userId),
      accountNumber,
      promptpayNumber,
      bankName: savedBankName, 
    });
  } else {
    wallet.accountNumber = accountNumber;
    wallet.promptpayNumber = promptpayNumber;
    wallet.bankName = savedBankName;            
    await wallet.save();
  }

  return NextResponse.json(wallet);
}
