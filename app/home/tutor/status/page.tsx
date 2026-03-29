"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function TutorStatusPage() {
  const [doc, setDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/tutor/verify/status")
      .then(res => {
        if (res.status === 401) { router.push("/login"); return null; }
        return res.json();
      })
      .then(d => { if (d) setDoc(d); setLoading(false); });
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-orange-50 font-sans tracking-tight antialiased flex items-center justify-center">
      <p className="text-gray-300 font-bold">กำลังโหลด...</p>
    </div>
  );

  if (!doc) return (
    <div className="min-h-screen bg-orange-50 font-sans tracking-tight antialiased flex flex-col">
      <div className="flex items-center px-10 py-5 bg-[#FC5404] text-white shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/home/tutor">
            <img src="/Edu_icon.png" alt="Edumatch Logo" width={120} height={35} className="object-contain cursor-pointer" />
          </Link>
          <div className="h-6 w-[1px] bg-white/30 ml-2"></div>
          <span className="text-lg font-black tracking-tighter uppercase">สถานะการยืนยัน</span>
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto w-full">
        <button
          onClick={() => router.push("/home/tutor")}
          className="mb-6 px-5 py-2.5 rounded-2xl bg-white border border-orange-100 text-[#FC5404] text-sm font-black shadow-sm hover:shadow-md hover:bg-orange-50 transition-all active:scale-95 flex items-center gap-2"
        >
          <span>‹</span> ย้อนกลับ
        </button>

        <div className="bg-white border border-orange-100 rounded-[32px] p-16 text-center border-2 border-dashed">
          <p className="text-gray-300 font-bold mb-6">ยังไม่ได้ส่งคำขอยืนยัน</p>
          <button
            onClick={() => router.push("/home/tutor/verify")}
            className="px-6 py-2.5 rounded-2xl bg-[#FC5404] hover:bg-orange-600 text-white text-sm font-black shadow-lg shadow-orange-100 transition-all active:scale-95"
          >
            ส่งคำขอยืนยัน
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50 font-sans tracking-tight antialiased flex flex-col">
      <div className="flex items-center px-10 py-5 bg-[#FC5404] text-white shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/home/tutor">
            <img src="/Edu_icon.png" alt="Edumatch Logo" width={120} height={35} className="object-contain cursor-pointer" />
          </Link>
          <div className="h-6 w-[1px] bg-white/30 ml-2"></div>
          <span className="text-lg font-black tracking-tighter uppercase">สถานะการยืนยัน</span>
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto w-full">
        <button
          onClick={() => router.back()}
          className="mb-6 px-5 py-2.5 rounded-2xl bg-white border border-orange-100 text-[#FC5404] text-sm font-black shadow-sm hover:shadow-md hover:bg-orange-50 transition-all active:scale-95 flex items-center gap-2"
        >
          <span>‹</span> ย้อนกลับ
        </button>

        <div className="bg-white border border-orange-100 rounded-[32px] p-8 shadow-sm max-w-lg">
          <h1 className="text-2xl font-black text-[#1e3a5f] mb-6">สถานะการยืนยันติวเตอร์</h1>

          {doc.status === "pending" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-[24px] p-6">
              <p className="text-sm font-black text-yellow-700 uppercase tracking-tighter mb-1">รอการยืนยัน</p>
              <p className="text-sm text-yellow-600 font-medium">แอดมินกำลังตรวจสอบเอกสารของคุณ</p>
            </div>
          )}

          {doc.status === "approved" && (
            <div className="bg-green-50 border border-green-200 rounded-[24px] p-6">
              <p className="text-sm font-black text-green-700 uppercase tracking-tighter mb-1">ผ่านการยืนยันแล้ว</p>
              <p className="text-sm text-green-600 font-medium">คุณสามารถสร้าง Course ได้แล้ว</p>
            </div>
          )}

          {doc.status === "rejected" && (
            <div className="bg-red-50 border border-red-200 rounded-[24px] p-6">
              <p className="text-sm font-black text-red-700 uppercase tracking-tighter mb-1">ไม่ผ่านการยืนยัน</p>
              {doc.rejectReason && (
                <p className="text-sm text-red-600 font-medium mt-1">เหตุผล: {doc.rejectReason}</p>
              )}
              <button
                onClick={() => router.push("/tutor/verify")}
                className="mt-4 px-5 py-2.5 rounded-2xl bg-[#FC5404] hover:bg-orange-600 text-white text-sm font-black shadow-lg shadow-orange-100 transition-all active:scale-95"
              >
                ส่งใหม่
              </button>
            </div>
          )}

          <p className="text-[11px] font-black text-gray-400 uppercase tracking-tighter mt-6">
            ส่งเมื่อ: {new Date(doc.createdAt).toLocaleString("th-TH")}
          </p>
        </div>
      </div>
    </div>
  );
}