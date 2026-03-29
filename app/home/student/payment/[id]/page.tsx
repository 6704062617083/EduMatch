"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Page() {
  const { id } = useParams();
  const [qr, setQr] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/payment/qr", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId: id }),
    })
      .then((res) => res.json())
      .then((data) => setQr(data.qr));
  }, [id]);

  async function handleUpload() {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("bookingId", id as string);
    await fetch("/api/payment/upload-slip", { method: "POST", body: formData });
    alert("ส่งสลิปแล้ว");
    router.push("/home/student/mybooking");
  }

  return (
    <div className="min-h-screen bg-[#fdf6ee] flex flex-col items-center justify-center px-5 py-10 font-sans">
      <div className="w-full max-w-[380px] mb-4">
        <button
          onClick={() => router.push("/home/student/mybooking")}
          className="bg-white hover:bg-orange-50 text-[#FC5404] px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border border-orange-100 shadow-sm active:scale-95 flex items-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          ย้อนกลับ
        </button>
      </div>

      <div className="relative w-full max-w-[380px]">
        <img
          src="/qr_template.png"
          alt="QR Template"
          className="w-full rounded-2xl shadow-2xl"
        />
        {qr && (
          <img
            src={qr}
            alt="QR Code"
            className="absolute left-[22.5%] top-[30%] w-[55%] h-auto"
          />
        )}
      </div>

      {!qr && <p className="text-gray-400 mt-4">กำลังโหลด QR Code...</p>}

      <div className="mt-7 w-full max-w-[380px] bg-white rounded-xl p-5 shadow-md">
        <p className="font-semibold mb-3 text-[#1a1a2e]">อัปโหลดสลิปการโอนเงิน</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="w-full mb-3"
        />
        <button
          onClick={() => {
            if (!file) return;
            setShowConfirm(true);
          }}
          className="w-full py-3 bg-[#f57c00] text-white rounded-lg font-bold text-base cursor-pointer hover:bg-[#e65100] transition-colors"
        >
          ส่งสลิป
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 shadow-xl">
            <h3 className="text-lg font-bold mb-2 text-gray-800">ยืนยันการชำระเงิน</h3>
            <p className="text-sm text-gray-600 mb-5">
              หากทำการชำระเงินแล้ว <span className="font-semibold text-red-500">จะไม่สามารถรับเงินคืนได้</span> ยืนยันที่จะส่งสลิปหรือไม่?
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition text-sm"
                onClick={() => setShowConfirm(false)}
              >
                ยกเลิก
              </button>
              <button
                className="flex-1 py-2 rounded-xl bg-[#f57c00] text-white hover:bg-[#e65100] transition text-sm font-semibold"
                onClick={() => {
                  setShowConfirm(false);
                  handleUpload();
                }}
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