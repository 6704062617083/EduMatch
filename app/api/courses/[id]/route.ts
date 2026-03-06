import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import mongoose from "mongoose";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const course = await Course.findById(id);

  if (!course) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  return NextResponse.json(course);
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await context.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const body = await req.json();

  // ป้องกันแก้คอร์สของ tutor คนอื่น
  const course = await Course.findById(id);

  if (!course) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  if (course.tutorId.toString() !== body.tutorId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  const updated = await Course.findByIdAndUpdate(
    id,
    {
      title: body.title,
      description: body.description,
      startTime: body.startTime,
      endTime: body.endTime,
      classLink: body.classLink,
      tags: body.tags,
    },
    { new: true }
  );

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  await connectDB();

  const { id } = await context.params;

  const tutorId = req.nextUrl.searchParams.get("tutorId");

  const course = await Course.findById(id);

  if (!course) {
    return NextResponse.json({ message: "Course not found" }, { status: 404 });
  }

  // ป้องกันลบคอร์สของ tutor คนอื่น
  if (course.tutorId.toString() !== tutorId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 403 });
  }

  await Course.findByIdAndDelete(id);

  return NextResponse.json({ message: "Deleted successfully" });
}