"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
      return { text: "รอแอดมินตรวจสอบ", cls: "bg-yellow-50 text-yellow-600 border-yellow-100" };
    if (b.paymentStatus === "paid" || b.bookingStatus === "confirmed")
      return { text: "ยืนยันแล้ว", cls: "bg-green-50 text-green-600 border-green-100" };
    if (b.paymentStatus === "reject")
      return { text: "สลิปไม่ผ่าน", cls: "bg-red-50 text-red-600 border-red-100" };
    if (b.bookingStatus === "pending")
      return { text: "รอติวเตอร์ตอบรับ", cls: "bg-yellow-50 text-yellow-600 border-yellow-100" };
    if (b.bookingStatus === "waiting_payment")
      return { text: "รอชำระเงิน", cls: "bg-orange-50 text-orange-500 border-orange-100" };
    if (b.bookingStatus === "cancelled")
      return { text: "ยกเลิกแล้ว", cls: "bg-red-50 text-red-600 border-red-100" };
    if (b.bookingStatus === "completed")
      return { text: "เสร็จสิ้น", cls: "bg-gray-50 text-gray-400 border-gray-100" };
    return { text: "ไม่ทราบสถานะ", cls: "bg-gray-50 text-gray-400 border-gray-100" };
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
    <div className="min-h-screen bg-orange-50 font-sans tracking-tight antialiased flex flex-col">
      <div className="flex items-center px-10 py-5 bg-[#FC5404] text-white shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/home/student">
            <Image 
              src="/Edu_icon.png" 
              alt="Edumatch Logo" 
              width={120} 
              height={35} 
              className="object-contain cursor-pointer" 
            />
          </Link>
          <div className="h-6 w-[1px] bg-white/30"></div>
          <span className="text-lg font-black tracking-tighter uppercase text-white">การจองของฉัน</span>
        </div>
      </div>

      <div className="w-full pb-12">
        <div className="px-10 mt-8 mb-6">
          <button
            onClick={() => router.push("/home/student")}
            className="bg-white hover:bg-orange-50 text-[#FC5404] px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border border-orange-100 shadow-sm active:scale-95 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            ย้อนกลับ
          </button>
        </div>

        <div className="max-w-3xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black text-[#1e3a5f] flex items-center gap-3">
              รายการจองทั้งหมด
              {!loading && (
                <span className="bg-orange-500 text-white text-sm px-2.5 py-0.5 rounded-full">
                  {bookings.length}
                </span>
              )}
            </h2>
          </div>

          {loading && (
            <div className="flex flex-col items-center py-20 text-orange-300">
              <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
              <p className="font-bold animate-pulse">กำลังโหลดข้อมูล...</p>
            </div>
          )}

          {!loading && bookings.length === 0 && (
            <div className="bg-white rounded-[32px] p-16 text-center border-2 border-orange-100 border-dashed text-gray-300 font-bold">
              ยังไม่มีการจอง
            </div>
          )}

          <div className="space-y-4">
            {bookings.map((b) => {
              const st = getStatusLabel(b);
              const canCancel = b.bookingStatus !== "completed" && b.bookingStatus !== "cancelled";
              return (
                <div
                  key={b.bookingId}
                  className="bg-white border border-orange-100 rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:ring-1 hover:ring-orange-200 transition-all duration-300"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="font-black text-[#1e3a5f] text-lg leading-tight truncate">
                          {b.courseTitle}
                        </h3>
                        <span className={`shrink-0 text-[10px] font-extrabold px-3 py-1 rounded-xl border uppercase tracking-wider ${st.cls}`}>
                          {st.text}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">เวลาเรียน</span>
                          <span className="text-[13px] font-bold text-[#1e3a5f]">
                            {new Date(b.startTime).toLocaleString()} – {new Date(b.endTime).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">ราคา</span>
                          <span className="text-[15px] font-black text-orange-500">฿{b.price?.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">Booking ID</span>
                          <span className="text-[11px] font-bold text-gray-400 font-mono">{b.bookingId}</span>
                        </div>
                      </div>

                      {b.bookingStatus === "waiting_payment" && b.paymentStatus !== "slip_uploaded" && (
                        <button
                          onClick={() => setPaymentBookingId(b.bookingId)}
                          className="mt-4 px-4 py-2.5 rounded-2xl bg-[#FC5404] hover:bg-orange-600 text-white text-sm font-black shadow-md shadow-orange-100 transition-all active:scale-95"
                        >
                          {b.paymentStatus === "reject" ? "⚠️ สลิปไม่ผ่าน — อัปโหลดใหม่" : "ไปชำระเงิน →"}
                        </button>
                      )}
                    </div>

                    {canCancel && (
                      <button
                        onClick={() => setCancelBookingId(b.bookingId)}
                        className="shrink-0 self-start text-sm font-bold text-red-500 border border-red-100 bg-red-50 hover:bg-red-100 rounded-2xl px-4 py-2.5 transition-all active:scale-95"
                      >
                        ยกเลิก
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {cancelBookingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-[32px] p-8 w-[420px] max-w-[90%] shadow-2xl border border-orange-100">
            <h3 className="text-xl font-black text-[#1e3a5f] mb-1">ยืนยันการยกเลิก</h3>
            <p className="text-sm font-bold text-gray-400 mb-6 leading-relaxed">
              หากทำการยกเลิกการจอง{" "}
              <span className="font-black text-red-500">จะไม่สามารถรับเงินคืนได้</span>{" "}
              ยืนยันที่จะยกเลิกการจองหรือไม่?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setCancelBookingId(null)}
                disabled={cancelling}
                className="flex-1 py-3.5 rounded-2xl border border-orange-100 text-[#1e3a5f] font-bold text-sm hover:bg-orange-50 transition-all active:scale-95 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-sm shadow-lg shadow-red-100 transition-all active:scale-95 disabled:opacity-60"
              >
                {cancelling ? "กำลังยกเลิก..." : "ยืนยัน"}
              </button>
            </div>
          </div>
        </div>
      )}

      {paymentBookingId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-[32px] p-8 w-[420px] max-w-[90%] shadow-2xl border border-orange-100">
            <h3 className="text-xl font-black text-[#1e3a5f] mb-1">ยืนยันการชำระเงิน</h3>
            <p className="text-sm font-bold text-gray-400 mb-6 leading-relaxed">
              หากทำการชำระเงินแล้ว{" "}
              <span className="font-black text-red-500">จะไม่สามารถรับเงินคืนได้</span>{" "}
              ยืนยันที่จะไปชำระเงินหรือไม่?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setPaymentBookingId(null)}
                className="flex-1 py-3.5 rounded-2xl border border-orange-100 text-[#1e3a5f] font-bold text-sm hover:bg-orange-50 transition-all active:scale-95"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmPayment}
                className="flex-1 py-3.5 rounded-2xl bg-[#FC5404] hover:bg-orange-600 text-white font-black text-sm shadow-lg shadow-orange-100 transition-all active:scale-95"
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