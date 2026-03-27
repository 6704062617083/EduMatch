import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import VerificationDocument from "@/models/VerificationDocument";
import cloudinary from "@/lib/cloudinary";
import { cookies } from "next/headers";

async function uploadToCloudinary(file: File) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  return new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          resource_type: "image", 
          type: "upload",
          use_filename: true,
          unique_filename: true,
        },
        (err, result) => {
          if (err) reject(err);
          else {
            console.log("secure_url:", result?.secure_url);
            resolve(result);
          }
        }
      )
      .end(buffer);
  });
}

export async function POST(req: Request) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existing = await VerificationDocument.findOne({ userId });
    if (existing) {
      if (existing.status === "rejected") {
        await VerificationDocument.deleteOne({ userId });
      } else {
        return NextResponse.json({ error: "Already submitted" }, { status: 400 });
      }
    }

    const formData = await req.formData();

    const nationalId       = formData.get("nationalId")?.toString()       || null;
    const firstNameEN      = formData.get("firstNameEN")?.toString()      || null;
    const lastNameEN       = formData.get("lastNameEN")?.toString()       || null;
    const province         = formData.get("province")?.toString()         || null;
    const ethnicity        = formData.get("ethnicity")?.toString()        || null;
    const nationality      = formData.get("nationality")?.toString()      || null;
    const religion         = formData.get("religion")?.toString()         || null;
    const birthDateRaw     = formData.get("birthDate")?.toString()        || null;
    const academicStrength = formData.get("academicStrength")?.toString() || null;
    const educationLevel   = formData.get("educationLevel")?.toString()   || null;
    const university       = formData.get("university")?.toString()       || null;
    const faculty          = formData.get("faculty")?.toString()          || null;
    const major            = formData.get("major")?.toString()            || null;
    const gpaRaw           = formData.get("gpa")?.toString()              || null;
    const tutorExpRaw      = formData.get("tutorExp")?.toString()         || null;

    const idCardFile      = formData.get("idCard")      as File | null;
    const certificateFile = formData.get("certificate") as File | null;
    const transcriptFile  = formData.get("transcript")  as File | null;
    const resumeFile      = formData.get("resume")      as File | null;
    const tutorPhotoFile  = formData.get("tutorPhoto")  as File | null;

    const MAX_SIZE = 5 * 1024 * 1024;
    for (const file of [idCardFile, certificateFile, transcriptFile, resumeFile, tutorPhotoFile]) {
      if (file && file.size > MAX_SIZE) {
        return NextResponse.json({ error: "ไฟล์ต้องไม่เกิน 5MB" }, { status: 400 });
      }
    }

    const idCardUrl      = idCardFile      ? (await uploadToCloudinary(idCardFile)).secure_url      : null;
    const certificateUrl = certificateFile ? (await uploadToCloudinary(certificateFile)).secure_url : null;
    const transcriptUrl  = transcriptFile  ? (await uploadToCloudinary(transcriptFile)).secure_url  : null;
    const resumeUrl      = resumeFile      ? (await uploadToCloudinary(resumeFile)).secure_url      : null;
    const tutorPhotoUrl  = tutorPhotoFile  ? (await uploadToCloudinary(tutorPhotoFile)).secure_url  : null;

    const doc = await VerificationDocument.create({
      userId,
      nationalId,
      firstNameEN,
      lastNameEN,
      province,
      ethnicity,
      nationality,
      religion,
      birthDate:        birthDateRaw ? new Date(birthDateRaw) : null,
      academicStrength,
      educationLevel,
      university,
      faculty,
      major,
      gpa:      gpaRaw      ? Number(gpaRaw)      : null,
      tutorExp: tutorExpRaw ? Number(tutorExpRaw) : null,
      idCardUrl,
      certificateUrl,
      transcriptUrl,
      resumeUrl,
      tutorPhotoUrl,
      status: "pending",
    });

    return NextResponse.json(doc);

  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
