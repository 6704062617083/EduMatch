"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

  if (loading) return <div className="p-10 text-gray-500">กำลังโหลด...</div>;

  if (!doc) return (
    <div className="p-10">
      <p className="mb-4">ยังไม่ได้ส่งคำขอยืนยัน</p>
      
      <button onClick={() => router.push("/home/tutor")} className="text-blue-500 hover:underline mr-4">
        ← ย้อนกลับ
      </button>
      
      <button
        onClick={() => router.push("/home/tutor/verify")}
        className="bg-blue-500 text-white px-5 py-2 rounded"
      >
        ส่งคำขอยืนยัน
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md">

        <button onClick={() => router.back()} className="text-blue-500 hover:underline mb-4 block">
          ← ย้อนกลับ
        </button>

        <h1 className="text-xl font-bold mb-4">สถานะการยืนยันติวเตอร์</h1>

        {doc.status === "pending" && (
          <div className="bg-yellow-50 border border-yellow-300 rounded p-4 text-yellow-800">
            <b>รอการยืนยัน</b><br/>
            แอดมินกำลังตรวจสอบเอกสารของคุณ
          </div>
        )}

        {doc.status === "approved" && (
          <div className="bg-green-50 border border-green-300 rounded p-4 text-green-800">
            <b>ผ่านการยืนยันแล้ว</b><br/>
            คุณสามารถสร้าง Course ได้แล้ว
          </div>
        )}

        {doc.status === "rejected" && (
          <div className="bg-red-50 border border-red-300 rounded p-4 text-red-800">
            <b>ไม่ผ่านการยืนยัน</b><br/>
            {doc.rejectReason && <p className="mt-1">เหตุผล: {doc.rejectReason}</p>}
            <button
              onClick={() => router.push("/tutor/verify")}
              className="mt-3 bg-red-500 text-white px-4 py-1 rounded text-sm"
            >
              ส่งใหม่
            </button>
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4">
          ส่งเมื่อ: {new Date(doc.createdAt).toLocaleString("th-TH")}
        </p>
      </div>
    </div>
  );
}