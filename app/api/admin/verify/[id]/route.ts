import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import VerificationDocument from "@/models/VerificationDocument";
import { cookies } from "next/headers";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const role = cookieStore.get("role")?.value;

    if (role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { status, rejectReason } = await req.json();

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const updateData: any = {
      status,
      verifiedAt: new Date(),
    };

    if (status === "rejected" && rejectReason) {
      updateData.rejectReason = rejectReason;
    }

    const doc = await VerificationDocument.findByIdAndUpdate(
      id,
      updateData,
      { returnDocument: "after" }
    ).populate("userId", "name surname email");

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(doc);

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}