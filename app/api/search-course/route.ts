import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Course from "@/models/Course";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const tag = searchParams.get("tag") || "";
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const query: any = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (tag) {
      query.tags = tag;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const courses = await Course.find(query).sort({ createdAt: -1 });

    return NextResponse.json(courses);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}