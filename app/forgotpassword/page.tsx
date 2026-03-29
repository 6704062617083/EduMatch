"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPopupMessage("รหัสผ่านไม่ตรงกัน");
      setIsSuccess(false);
      setShowPopup(true);
      return;
    }
    const res = await fetch("/api/forgotpass", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword, otp }),
    });
    const data = await res.json();
    if (res.ok) {
      setPopupMessage("เปลี่ยนรหัสผ่านสำเร็จ");
      setIsSuccess(true);
      setEmail(""); setNewPassword(""); setConfirmPassword(""); setOtp("");
    } else {
      setPopupMessage(data.message || "เกิดข้อผิดพลาด");
      setIsSuccess(false);
    }
    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);
    if (isSuccess) router.push("/login");
  };

  const handleResend = async () => {
    if (!email) return alert("กรุณากรอกอีเมลก่อน");
    const res = await fetch("/api/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) { setTimer(60); alert("ส่ง OTP ไปที่อีเมลแล้ว"); }
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
          onClick={() => router.push("/login")}
          className="absolute top-6 left-6 bg-orange-50 hover:bg-orange-100 text-[#FC5404] px-4 py-2 rounded-2xl text-sm font-bold transition-all border border-orange-100 active:scale-95 flex items-center gap-1.5"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          ย้อนกลับ
        </button>

        <h1 className="text-center text-2xl font-black text-[#1e3a5f] mb-8">ลืมรหัสผ่าน</h1>

        <form onSubmit={handleReset} className="grid gap-4">
          <input type="email" placeholder="อีเมล" value={email} onChange={(e) => setEmail(e.target.value)} required className={inputCls} />
          <input type="password" placeholder="รหัสผ่านใหม่" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputCls} />
          <input type="password" placeholder="ยืนยันรหัสผ่าน" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputCls} />

          <div className="flex gap-2">
            <input type="text" maxLength={6} placeholder="กรอก OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required className={inputCls + " flex-1"} />
            <button
              type="button"
              onClick={handleResend}
              disabled={timer > 0}
              className={`px-4 py-3 rounded-2xl text-white font-black text-sm transition-all active:scale-95 ${timer > 0 ? "bg-gray-300 cursor-not-allowed" : "bg-[#FC5404] hover:bg-orange-600"}`}
            >
              {timer > 0 ? `${timer}s` : "ส่ง OTP"}
            </button>
          </div>

          <button type="submit" className="w-full mt-6 py-4 bg-[#FC5404] hover:bg-orange-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-orange-100 transition-all active:scale-95">
            รีเซ็ตรหัสผ่าน
          </button>
        </form>

        {showPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5 border border-orange-100">
              <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
              <p className="text-sm font-bold text-[#1e3a5f] text-center leading-relaxed">{popupMessage}</p>
              <button onClick={handleClosePopup} className="w-full py-3.5 rounded-2xl bg-[#FC5404] hover:bg-orange-600 text-white text-sm font-black shadow-lg shadow-orange-100 transition-all active:scale-95">
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