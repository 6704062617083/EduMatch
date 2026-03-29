"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const type = searchParams.get("type");
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [timer, setTimer] = useState(60);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, type }),
    });
    const data = await res.json();
    if (res.ok) {
      setPopupMessage("สมัครสมาชิกสำเร็จ");
      setIsSuccess(true);
      setShowPopup(true);
    } else {
      setPopupMessage("เกิดข้อผิดพลาด: " + data.message);
      setIsSuccess(false);
      setShowPopup(true);
    }
  };

  const handleResend = async () => {
    const res = await fetch("/api/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, type }),
    });
    const data = await res.json();
    if (res.ok) { alert("ส่ง OTP ใหม่ไปที่อีเมลคุณแล้ว"); setTimer(60); }
    else alert(data.message);
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4 font-sans tracking-tight antialiased">
      <div className="w-full max-w-md bg-white rounded-[32px] border border-orange-100 shadow-sm p-8 relative">
        <Image
          src="/Asset 5.png"
          alt="Edumatch Logo"
          width={160}
          height={160}
          className="mx-auto mb-4 object-contain"
        />

        <button
          onClick={() => router.back()}
          className="absolute top-6 left-6 bg-orange-50 hover:bg-orange-100 text-[#FC5404] px-4 py-2 rounded-2xl text-sm font-bold transition-all border border-orange-100 active:scale-95 flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          ย้อนกลับ
        </button>

        <h1 className="text-center text-2xl font-black text-[#1e3a5f] mb-2">Verify OTP</h1>
        <p className="text-center text-sm text-gray-400 mb-6">OTP ถูกส่งไปที่ <b>{email}</b></p>

        <p className="text-center text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">กรุณากรอก OTP ภายใน 5 นาที</p>

        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          placeholder="กรอก OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className={inputCls + " mb-2 text-center tracking-widest"}
        />

        <p className="text-center text-sm text-gray-400 mb-4">สามารถขอรหัสใหม่ได้ใน {timer} วินาที</p>

        <button
          onClick={handleVerify}
          className="w-full py-4 bg-[#FC5404] hover:bg-orange-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-orange-100 transition-all active:scale-95 mb-2"
        >
          ยืนยัน OTP
        </button>

        <button
          onClick={handleResend}
          disabled={timer > 0}
          className={`w-full py-3 rounded-2xl text-sm font-black transition-all active:scale-95 ${timer > 0 ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-white text-[#FC5404] border border-[#FC5404] hover:bg-orange-50"}`}
        >
          ส่ง OTP อีกครั้ง
        </button>

        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5 border border-orange-100">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
              <p className="text-sm font-bold text-[#1e3a5f] text-center leading-relaxed">{popupMessage}</p>
              <button
                onClick={() => { setShowPopup(false); if (isSuccess) router.push("/login"); }}
                className="w-full py-3.5 rounded-2xl bg-[#FC5404] hover:bg-orange-600 text-white text-sm font-black shadow-lg shadow-orange-100 transition-all active:scale-95"
              >
                ปิด
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const inputCls = "w-full px-4 py-3 rounded-2xl border border-orange-100 bg-orange-50/50 text-sm font-black text-[#1e3a5f] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all";