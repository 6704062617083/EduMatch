import { NextResponse } from "next/server";

export async function POST() {
  try {

    const response = NextResponse.json(
      { message: "ออกจากระบบสำเร็จ" },
      { status: 200 }
    );

    response.cookies.set("role", "", { expires: new Date(0) });
    response.cookies.set("userId", "", { expires: new Date(0) });
    response.cookies.set("name", "", { expires: new Date(0) });
    response.cookies.set("surname", "", { expires: new Date(0) });

    return response;

  } catch (error: any) {
    return NextResponse.json(
      { message: "Server Error: " + error.message },
      { status: 500 }
    );
  }
}