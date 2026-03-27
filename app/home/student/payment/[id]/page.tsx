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
      <h1 className="text-2xl text-[#1a1a2e] mb-6">ชำระเงิน</h1>

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
            className="absolute"
            style={{
              left: "22.5%",
              top: "30%",
              width: "55%",
              height: "auto",
            }}
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
          className="w-full py-3 bg-[#f57c00] text-white border-none rounded-lg font-bold text-base cursor-pointer"
        >
          ส่งสลิป
        </button>
      </div>
    </div>
  );
}