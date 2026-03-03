import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

export async function GET() {
  await connectDB();
  const courses = await Course.find().sort({ createdAt: -1 });
  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  await connectDB();
  const body = await req.json();

  const newCourse = await Course.create({
    title: body.title,
    description: body.description,
    startTime: body.startTime,
    endTime: body.endTime,
  });

  return NextResponse.json(newCourse, { status: 201 });
}