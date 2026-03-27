"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyBooking() {
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: any;

    fetch("/api/me")
      .then(res => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then(u => {
        setUser(u);

        const fetchBookings = () => {
          fetch(`/api/studentbooking?studentId=${u._id}`)
            .then(res => res.json())
            .then(data => {
              setBookings(prev =>
                JSON.stringify(prev) !== JSON.stringify(data) ? data : prev
              );
              setLoading(false);
            });
        };

        fetchBookings();
        interval = setInterval(fetchBookings, 3000);
      })
      .catch(() => {
        window.location.href = "/login";
      });

    return () => clearInterval(interval);
  }, []);

  const getStatusLabel = (b: any) => {
    if (b.paymentStatus === "slip_uploaded")
      return { text: "รอแอดมินตรวจสอบ", color: "text-yellow-500" };
    if (b.paymentStatus === "paid" || b.status === "confirmed")
      return { text: "ยืนยันแล้ว", color: "text-green-500" };
    if (b.status === "pending")
      return { text: "รอติวเตอร์ตอบรับ", color: "text-yellow-500" };
    if (b.status === "waiting_payment")
      return { text: "รอชำระเงิน", color: "text-orange-500" };
    if (b.status === "cancelled")
      return { text: "ยกเลิกแล้ว", color: "text-red-500" };
    if (b.status === "completed")
      return { text: "เสร็จสิ้น", color: "text-gray-500" };
    return { text: "ไม่ทราบสถานะ", color: "text-gray-400" };
  };

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

          {loading && <p>กำลังโหลด...</p>}

          {!loading && bookings.length === 0 && (
            <p className="text-gray-500">ยังไม่มีการจอง</p>
          )}

          {bookings.map((b) => {
            const st = getStatusLabel(b);
            return (
              <div key={b.bookingId} className="border rounded-xl p-4">
                <p className="font-semibold">{b.courseTitle}</p>

                <p className="text-sm text-gray-600">
                  เวลา: {new Date(b.startTime).toLocaleString()} -{" "}
                  {new Date(b.endTime).toLocaleString()}
                </p>

                <p className="text-sm text-gray-600">ราคา: {b.price} บาท</p>

                <p className="text-sm mt-2">
                  สถานะ: <span className={st.color}>{st.text}</span>
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Booking: {b.bookingId}
                </p>

                {b.status === "waiting_payment" &&
                  b.paymentStatus !== "slip_uploaded" && (
                    <button
                      className="mt-2 text-blue-600 hover:underline text-sm"
                      onClick={() =>
                        router.push(`/home/student/payment/${b.bookingId}`)
                      }
                    >
                      {b.paymentStatus === "reject"
                        ? "⚠️ สลิปไม่ผ่าน — อัปโหลดใหม่"
                        : "ไปชำระเงิน"}
                    </button>
                  )}
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}