import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";
import User from "@/models/User";

export async function GET() {
  try {
    await connectDB();

    const courses = await Course.find().sort({ createdAt: -1 });

    const coursesWithTutor = await Promise.all(
      courses.map(async (course) => {
        const tutor = await User.findById(course.tutorId).select(
          "name surname"
        );

        return {
          _id: course._id,
          title: course.title,
          description: course.description,
          startTime: course.startTime,
          endTime: course.endTime,
          price: course.price,
          tags: course.tags,
          classLink: course.classLink,
          tutor: tutor
            ? {
                name: tutor.name,
                surname: tutor.surname,
              }
            : null,
        };
      })
    );

    return NextResponse.json(coursesWithTutor);
  } catch (error) {
    console.error("STUDENT COURSES ERROR:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}