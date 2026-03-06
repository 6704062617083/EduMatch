import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const tutorId = req.nextUrl.searchParams.get("tutorId");

    if (!tutorId) {
      return NextResponse.json([]);
    }

    const courses = await Course.find({ tutorId }).sort({ createdAt: -1 });

    return NextResponse.json(courses);
  } catch (error) {
    console.error("GET COURSE ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    if (!body.title || !body.tutorId) {
      return NextResponse.json(
        { message: "title and tutorId required" },
        { status: 400 }
      );
    }

    const newCourse = await Course.create({
      title: body.title,
      description: body.description || "",
      startTime: body.startTime || null,
      endTime: body.endTime || null,
      classLink: body.classLink || "",
      tags: Array.isArray(body.tags) ? body.tags : [],
      tutorId: body.tutorId,
    });

    return NextResponse.json(newCourse, { status: 201 });
  } catch (error) {
    console.error("CREATE COURSE ERROR:", error);
    return NextResponse.json({ message: "Create failed" }, { status: 500 });
  }
}