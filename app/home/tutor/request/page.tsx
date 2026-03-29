"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function BookingRequests() {
  const router = useRouter();

  const [requests, setRequests] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetch("/api/me")
      .then(res => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then(u => {
        setUser(u);
        fetch(`/api/booking?tutorId=${u._id}`)
          .then(res => res.json())
          .then(data => setRequests(data));
      })
      .catch(() => { window.location.href = "/login"; });
  }, []);

  const handleAction = async (bookingId: string, action: "accept" | "reject") => {
    const res = await fetch(`/api/booking/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });

    if (res.ok) {
      setRequests(prev => prev.filter(r => r.bookingId !== bookingId));
      alert(action === "accept" ? "รับคำขอแล้ว" : "ปฏิเสธคำขอแล้ว");
    } else {
      alert("เกิดข้อผิดพลาด");
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 font-sans tracking-tight antialiased flex flex-col">
      <div className="flex items-center px-10 py-5 bg-[#FC5404] text-white shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/home/tutor">
            <img src="/Edu_icon.png" alt="Edumatch Logo" width={120} height={35} className="object-contain cursor-pointer" />
          </Link>
          <div className="h-6 w-[1px] bg-white/30 ml-2"></div>
          <span className="text-lg font-black tracking-tighter uppercase">คำร้องการจอง</span>
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto w-full">
        <button
          onClick={() => router.push("/home/tutor")}
          className="mb-6 px-5 py-2.5 rounded-2xl bg-white border border-orange-100 text-[#FC5404] text-sm font-black shadow-sm hover:shadow-md hover:bg-orange-50 transition-all active:scale-95 flex items-center gap-2"
        >
          <span>‹</span> ย้อนกลับ
        </button>

        <div className="bg-white border border-orange-100 rounded-[32px] p-8 shadow-sm">
          <h2 className="text-2xl font-black text-[#1e3a5f] flex items-center gap-3 mb-6">
            คำร้องการจอง
            <span className="bg-orange-500 text-white text-sm px-2.5 py-0.5 rounded-full">{requests.length}</span>
          </h2>

          {requests.length === 0 ? (
            <div className="bg-white rounded-[32px] p-16 text-center border-2 border-orange-100 border-dashed text-gray-300 font-bold">
              ยังไม่มีคำร้องการจอง
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((r) => (
                <div
                  key={r.bookingId}
                  className="bg-white border border-orange-100 rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:ring-1 hover:ring-orange-200 transition-all duration-300"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-[#1e3a5f] mb-3 leading-tight">{r.courseTitle}</h3>

                      <div className="flex flex-wrap gap-4 text-[12px] text-gray-400 font-medium">
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          นักเรียน: {r.studentName}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {new Date(r.startTime).toLocaleString()} — {new Date(r.endTime).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <p className="text-2xl font-black text-orange-500">฿{r.price?.toLocaleString()}</p>
                        <p className="text-[11px] text-gray-400 font-medium">ต่อคอร์ส</p>
                      </div>

                      <p className="text-[10px] font-black text-gray-300 uppercase tracking-tighter mt-2">ID: {r.bookingId}</p>
                    </div>

                    <div className="flex gap-2 ml-6">
                      <button
                        className="px-5 py-2.5 rounded-2xl bg-green-50 border border-green-200 text-green-600 text-sm font-black hover:bg-green-100 transition-all active:scale-95"
                        onClick={() => handleAction(r.bookingId, "accept")}
                      >
                        ✓ รับ
                      </button>
                      <button
                        className="px-5 py-2.5 rounded-2xl bg-red-50 border border-red-100 text-red-500 text-sm font-black hover:bg-red-100 transition-all active:scale-95"
                        onClick={() => handleAction(r.bookingId, "reject")}
                      >
                        ✕ ปฏิเสธ
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}