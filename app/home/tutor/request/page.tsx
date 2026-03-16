"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function BookingRequests() {
  const router = useRouter();

  const [requests, setRequests] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return;

    const u = JSON.parse(stored);
    setUser(u);

    fetch(`/api/booking?tutorId=${u._id}`)
      .then((res) => res.json())
      .then((data) => setRequests(data));
  }, []);

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

          {requests.length === 0 && (
            <p className="text-gray-500">
              ยังไม่มีคำร้องการจอง
            </p>
          )}

          {requests.map((r) => (
            <div
              key={r.bookingId}
              className="border rounded-xl p-4 flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">
                  {r.courseTitle}
                </p>

                <p className="text-sm text-gray-600">
                  นักเรียน: {r.studentName}
                </p>

                <p className="text-sm text-gray-600">
                  เวลา: {new Date(r.startTime).toLocaleString()} -{" "}
                  {new Date(r.endTime).toLocaleString()}
                </p>

                <p className="text-sm text-gray-600">
                  ราคา: {r.price} บาท
                </p>

                <p className="text-xs text-gray-400">
                  Booking: {r.bookingId}
                </p>
              </div>

              <div className="flex gap-2">

                <button
                  className="bg-green-500 text-white px-3 py-1 rounded-lg"
                >
                  Accept
                </button>

                <button
                  className="bg-red-500 text-white px-3 py-1 rounded-lg"
                >
                  Reject
                </button>

              </div>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}