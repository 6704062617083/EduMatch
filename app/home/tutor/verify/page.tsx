"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TutorVerify() {

  const [idCard, setIdCard] = useState<File | null>(null);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-2xl font-bold mb-6">ติวเตอร์</h1>

      <div className="bg-white p-8 rounded-xl shadow-md">

        <div className="flex items-center mb-4">
          <button
            onClick={() => router.back()}
            className="text-blue-500 hover:underline mr-4"
          >
            ← ย้อนกลับ
          </button>
        </div>

{/* ข้อมูลส่วนบุคคล */}
        <h2 className="text-xl font-semibold mb-4">ข้อมูลส่วนบุคคล</h2>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <input placeholder="รหัสบัตรประชาชน" className="border p-2 rounded"/>
          <input placeholder="อีเมล" className="border p-2 rounded"/>

          <input placeholder="ชื่อ" className="border p-2 rounded"/>
          <input placeholder="นามสกุล" className="border p-2 rounded"/>

          <input placeholder="ชื่อ (English)" className="border p-2 rounded"/>
          <input placeholder="นามสกุล (English)" className="border p-2 rounded"/>

          <input placeholder="เบอร์โทรศัพท์" className="border p-2 rounded"/>
          <input placeholder="จังหวัดที่อาศัย" className="border p-2 rounded"/>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <input placeholder="เชื้อชาติ" className="border p-2 rounded"/>
          <input placeholder="สัญชาติ" className="border p-2 rounded"/>
          <input placeholder="ศาสนา" className="border p-2 rounded"/>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <input type="date" className="border p-2 rounded"/>
          <input placeholder="ส่วนสูง (cm)" className="border p-2 rounded"/>
          <input placeholder="น้ำหนัก (kg)" className="border p-2 rounded"/>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <input placeholder="หมู่โลหิต" className="border p-2 rounded"/>
          <input placeholder="สถานภาพสมรส" className="border p-2 rounded"/>
          <input placeholder="ความถนัดทางวิชาการ" className="border p-2 rounded"/>
        </div>


{/* ข้อมูลการศึกษา */}
        <h2 className="text-xl font-semibold mb-4">ข้อมูลการศึกษา</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <input placeholder="ชื่อสถาบันการศึกษา" className="border p-2 rounded"/>
          <input placeholder="คณะ" className="border p-2 rounded"/>

          <input placeholder="สาขาวิชา" className="border p-2 rounded"/>
          <input placeholder="เกรดเฉลี่ย (GPA)" className="border p-2 rounded"/>
        </div>


{/* แนบไฟล์ */}
        <h2 className="text-xl font-semibold mb-4">แนบเอกสาร</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">

          <div>
            <label className="block mb-1">บัตรประชาชน</label>
            <div className="flex items-center border rounded p-2">
              <span className="flex-1 text-sm text-gray-600">
                {idCard ? idCard.name : "ยังไม่ได้เลือกไฟล์"}
              </span>
              <label className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer text-sm">
                เลือกไฟล์
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setIdCard(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block mb-1">ประกาศนียบัตร/ปริญญาบัตร</label>
            <div className="flex items-center border rounded p-2">
              <span className="flex-1 text-sm text-gray-600">
                {certificate ? certificate.name : "ยังไม่ได้เลือกไฟล์"}
              </span>
              <label className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer text-sm">
                เลือกไฟล์
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setCertificate(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block mb-1">Transcript</label>
            <div className="flex items-center border rounded p-2">
              <span className="flex-1 text-sm text-gray-600">
                {transcript ? transcript.name : "ยังไม่ได้เลือกไฟล์"}
              </span>
              <label className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer text-sm">
                เลือกไฟล์
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setTranscript(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block mb-1">Resume</label>
            <div className="flex items-center border rounded p-2">
              <span className="flex-1 text-sm text-gray-600">
                {resume ? resume.name : "ยังไม่ได้เลือกไฟล์"}
              </span>
              <label className="bg-blue-500 text-white px-3 py-1 rounded cursor-pointer text-sm">
                เลือกไฟล์
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => setResume(e.target.files?.[0] || null)}
                />
              </label>
            </div>
          </div>

        </div>

        <button className="bg-blue-500 text-white px-6 py-2 rounded">
          ส่งข้อมูล
        </button>

      </div>
    </div>
  );
}