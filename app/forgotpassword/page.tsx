"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, newPassword, otp }),
    });

    const data = await res.json();

    if (res.ok) {
      setPopupMessage("เปลี่ยนรหัสผ่านสำเร็จ");
      setIsSuccess(true);

      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
      setOtp("");
    } else {
      setPopupMessage(data.message || "เกิดข้อผิดพลาด");
      setIsSuccess(false);
    }

    setShowPopup(true);
  };

  const handleClosePopup = () => {
    setShowPopup(false);

    if (isSuccess) {
      router.push("/login");
    }
  };

  const handleResend = async () => {
    if (!email) {
      alert("กรุณากรอกอีเมลก่อน");
      return;
    }

    const res = await fetch("/api/resend-otp", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      setTimer(60);
      alert("ส่ง OTP ไปที่อีเมลแล้ว");
    } else {
      alert(data.message);
    }
  };

  return (
    <div
      style={{
        padding: "100px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f6f9",
        minHeight: "100vh",
      }}
    >
      <div
        style={{
          width: "420px",
          background: "white",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
          textAlign: "center",
          position: "relative",
        }}
      >
    
        <h1>ลืมรหัสผ่าน</h1>

        <div style={{ textAlign: "left", marginBottom: "20px" }}>
          <button
            onClick={() => router.push("/login")}
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

        <form onSubmit={handleReset} style={{ maxWidth: "300px", margin: "0 auto" }}>
          <input
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="รหัสผ่านใหม่"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="password"
            placeholder="ยืนยันรหัสผ่าน"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={inputStyle}
          />

          <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
            <input
              type="text"
              maxLength={6}
              placeholder="กรอก OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              style={{ ...inputStyle, marginBottom: 0 }}
            />

            <button
              type="button"
              onClick={handleResend}
              disabled={timer > 0}
              style={{
                padding: "10px",
                background: timer > 0 ? "#ccc" : "#0070f3",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: timer > 0 ? "not-allowed" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {timer > 0 ? `${timer}s` : "ส่ง OTP"}
            </button>
          </div>

          <button type="submit" style={buttonStyle}>
            รีเซ็ตรหัสผ่าน
          </button>
        </form>

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
                onClick={handleClosePopup}
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
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};

const buttonStyle = {
  width: "100%",
  padding: "10px",
  background: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  marginTop: "10px",
};