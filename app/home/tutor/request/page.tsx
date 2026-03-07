"use client";

import { useRouter } from "next/navigation";

export default function BookingRequests() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      {/* Header */}
      <h1 className="text-2xl font-bold mb-2">ติวเตอร์</h1>

      <button
        onClick={() => router.push("/home/tutor")}
        className="text-sm mb-6 hover:underline"
      >
        ← ย้อนกลับ
      </button>

      {/* Booking Request Box */}
      <div className="bg-white rounded-3xl border-2 border-black p-6">

        <h2 className="text-xl font-semibold mb-4">
          คำร้องการจอง
        </h2>

        {/* รายการคำร้อง */}
        <div className="space-y-4">
        </div>

      </div>
    </div>
  );
}