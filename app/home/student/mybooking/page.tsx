"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyBooking() {
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/me")
      .then(res => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then(u => {
        setUser(u);
        fetch(`/api/studentbooking?studentId=${u._id}`)
          .then(res => res.json())
          .then(data => setBookings(data));
      })
      .catch(() => { window.location.href = "/login"; });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-10">

      <h1 className="text-2xl font-bold mb-2">นักเรียน</h1>

      <button
        onClick={() => router.push("/home/student")}
        className="text-sm mb-6 hover:underline"
      >
        ← ย้อนกลับ
      </button>

      <div className="bg-white rounded-3xl border-2 border-black p-6">

        <h2 className="text-xl font-semibold mb-4">My Bookings</h2>

        <div className="space-y-4">

          {bookings.length === 0 && (
            <p className="text-gray-500">ยังไม่มีการจอง</p>
          )}

          {bookings.map((b) => (
            <div key={b.bookingId} className="border rounded-xl p-4">
              <p className="font-semibold">{b.courseTitle}</p>

              <p className="text-sm text-gray-600">
                เวลา: {new Date(b.startTime).toLocaleString()} -{" "}
                {new Date(b.endTime).toLocaleString()}
              </p>

              <p className="text-sm text-gray-600">ราคา: {b.price} บาท</p>

              <p className="text-sm mt-2">
                สถานะ:{" "}
                <span className={
                  b.status === "pending" ? "text-yellow-500" :
                  b.status === "waiting_payment" ? "text-orange-500" :
                  b.status === "confirmed" ? "text-green-500" :
                  b.status === "cancelled" ? "text-red-500" :
                  "text-gray-500"
                }>
                  {b.status === "pending" && "รอติวเตอร์ตอบรับ"}
                  {b.status === "waiting_payment" && "รอชำระเงิน"}
                  {b.status === "confirmed" && "ยืนยันแล้ว"}
                  {b.status === "cancelled" && "ยกเลิกแล้ว"}
                  {b.status === "completed" && "เสร็จสิ้น"}
                </span>
              </p>

              <p className="text-xs text-gray-400 mt-1">Booking: {b.bookingId}</p>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
}