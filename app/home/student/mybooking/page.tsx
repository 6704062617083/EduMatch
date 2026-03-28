"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function MyBooking() {
  const router = useRouter();

  const [bookings, setBookings] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [paymentBookingId, setPaymentBookingId] = useState<string | null>(null);

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

    if (b.paymentStatus === "paid" || b.bookingStatus === "confirmed")
      return { text: "ยืนยันแล้ว", color: "text-green-500" };

    if (b.paymentStatus === "reject")
      return { text: "สลิปไม่ผ่าน", color: "text-red-500" };

    if (b.bookingStatus === "pending")
      return { text: "รอติวเตอร์ตอบรับ", color: "text-yellow-500" };

    if (b.bookingStatus === "waiting_payment")
      return { text: "รอชำระเงิน", color: "text-orange-500" };

    if (b.bookingStatus === "cancelled")
      return { text: "ยกเลิกแล้ว", color: "text-red-500" };

    if (b.bookingStatus === "completed")
      return { text: "เสร็จสิ้น", color: "text-gray-500" };

    return { text: "ไม่ทราบสถานะ", color: "text-gray-400" };
  };

  const handleConfirmCancel = async () => {
    if (!cancelBookingId) return;
    setCancelling(true);
    try {
      await fetch(`/api/booking/cancel`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: cancelBookingId }),
      });
    } finally {
      setCancelling(false);
      setCancelBookingId(null);
    }
  };

  const handleConfirmPayment = () => {
    if (!paymentBookingId) return;
    router.push(`/home/student/payment/${paymentBookingId}`);
    setPaymentBookingId(null);
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
            const canCancel = b.bookingStatus !== "completed" && b.bookingStatus !== "cancelled";
            return (
              <div key={b.bookingId} className="border rounded-xl p-4 flex justify-between items-start">

                <div>
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

                  {b.bookingStatus === "waiting_payment" &&
                    b.paymentStatus !== "slip_uploaded" && (
                      <button
                        className="mt-2 text-blue-600 hover:underline text-sm"
                        onClick={() => setPaymentBookingId(b.bookingId)}
                      >
                        {b.paymentStatus === "reject"
                          ? "⚠️ สลิปไม่ผ่าน — อัปโหลดใหม่"
                          : "ไปชำระเงิน"}
                      </button>
                    )}
                </div>

                {canCancel && (
                  <button
                    className="text-sm text-red-500 border border-red-400 rounded-lg px-3 py-1 hover:bg-red-50 transition shrink-0 self-center ml-4"
                    onClick={() => setCancelBookingId(b.bookingId)}
                  >
                    ยกเลิกการจอง
                  </button>
                )}

              </div>
            );
          })}

        </div>
      </div>

      {cancelBookingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
            <h3 className="text-lg font-bold mb-2 text-gray-800">ยืนยันการยกเลิก</h3>
            <p className="text-sm text-gray-600 mb-5">
              หากทำการยกเลิกการจอง <span className="font-semibold text-red-500">จะไม่สามารถรับเงินคืนได้</span> ยืนยันที่จะยกเลิกการจองหรือไม่?
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition text-sm"
                onClick={() => setCancelBookingId(null)}
                disabled={cancelling}
              >
                ยกเลิก
              </button>
              <button
                className="flex-1 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition text-sm font-semibold disabled:opacity-60"
                onClick={handleConfirmCancel}
                disabled={cancelling}
              >
                {cancelling ? "กำลังยกเลิก..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentBookingId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
            <h3 className="text-lg font-bold mb-2 text-gray-800">ยืนยันการชำระเงิน</h3>
            <p className="text-sm text-gray-600 mb-5">
              หากทำการชำระเงินแล้ว <span className="font-semibold text-red-500">จะไม่สามารถรับเงินคืนได้</span> ยืนยันที่จะไปชำระเงินหรือไม่?
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition text-sm"
                onClick={() => setPaymentBookingId(null)}
              >
                ยกเลิก
              </button>
              <button
                className="flex-1 py-2 rounded-xl bg-blue-500 text-white hover:bg-blue-600 transition text-sm font-semibold"
                onClick={handleConfirmPayment}
              >
                ยืนยัน
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}