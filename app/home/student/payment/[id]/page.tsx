"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";

export default function Page() {
  const { id } = useParams();
  const [qr, setQr] = useState("");
  const [file, setFile] = useState<File | null>(null);
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
          className="flex items-center gap-2 text-[#f57c00] font-semibold text-sm hover:opacity-75 transition-opacity"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
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
          onClick={handleUpload}
          className="w-full py-3 bg-[#f57c00] text-white rounded-lg font-bold text-base cursor-pointer hover:bg-[#e65100] transition-colors"
        >
          ส่งสลิป
        </button>
      </div>
    </div>
  );
}