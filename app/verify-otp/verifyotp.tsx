"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyOTP() {
  const [otp, setOtp] = useState("");
  const router = useRouter();

  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const type = searchParams.get("type"); 

  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);

  // เพิ่ม timer สำหรับนับถอยหลัง
  const [timer, setTimer] = useState(60);

  // countdown timer
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, type }), 
    });

    const data = await res.json();

    if (res.ok) {
      alert("ส่ง OTP ใหม่ไปที่อีเมลคุณแล้ว");
      setTimer(60);
    } else {
      alert(data.message);
    }
  };

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "sans-serif",
          background: "#f4f6f9",
        }}
      >
        <div
          style={{
            width: "600px",
            background: "white",
            padding: "40px",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            textAlign: "center",
            position: "relative",
          }}
        >
          <div style={{ textAlign: "left", marginBottom: "20px" }}>
            <button
              onClick={() => router.back()}
              className="text-blue-500 hover:underline"
              style={{
                position: "absolute",
                top: "20px",
                left: "20px",
              }}
            >
              ← ย้อนกลับ
            </button>
          </div>

          <h1 style={{ marginBottom: "10px" }}>
            EduMatch Verify OTP
          </h1>

          <p style={{ marginBottom: "20px", color: "#666" }}>
            OTP ถูกส่งไปที่ <b>{email}</b>
          </p>

          <p style={{ marginBottom: "10px", color: "#444", fontWeight: "bold" }}>
            กรุณากรอก OTP ภายใน 5 นาที
          </p>

          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="กรอก OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            style={{
              padding: "14px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontSize: "16px",
              width: "100%",
              textAlign: "center",
              letterSpacing: "5px",
            }}
          />

          <p style={{ marginTop: "5px", color: "#888" }}>
            สามารถขอรหัสใหม่ได้ใน {timer} วินาที
          </p>

          <button
            onClick={handleVerify}
            style={{
              width: "100%",
              marginTop: "25px",
              padding: "14px",
              background: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            ยืนยัน OTP
          </button>

          <button
            onClick={handleResend}
            disabled={timer > 0}
            style={{
              padding: "8px 18px",
              borderRadius: "6px",
              border: "1px solid #0070f3",
              background: timer > 0 ? "#ccc" : "white",
              color: timer > 0 ? "#666" : "#0070f3",
              cursor: timer > 0 ? "not-allowed" : "pointer",
              fontWeight: "bold",
            }}
          >
            ส่ง OTP อีกครั้ง
          </button>
        </div>
      </div>

      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "30px",
              borderRadius: "12px",
              textAlign: "center",
              minWidth: "300px",
            }}
          >
            <h2>{popupMessage}</h2>

            <button
              onClick={() => {
                setShowPopup(false);
                if (isSuccess) {
                  router.push("/login");
                }
              }}
              style={{
                marginTop: "15px",
                padding: "8px 20px",
                background: "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </>
  );
}