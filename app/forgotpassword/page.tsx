"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleReset(e: React.FormEvent) {
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
      body: JSON.stringify({ email, newPassword }),
    });

    const data = await res.json();

    if (res.ok) {
      setPopupMessage("เปลี่ยนรหัสผ่านสำเร็จ");
      setIsSuccess(true);

      setEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPopupMessage(data.message || "เกิดข้อผิดพลาด");
      setIsSuccess(false);
    }

    setShowPopup(true);
  }

  function handleClosePopup() {
    setShowPopup(false);

    if (isSuccess) {
      router.push("/login");
    }
  }

  return (
    <div style={{ padding: "100px", textAlign: "center" }}>
      <h1>ลืมรหัสผ่าน</h1>

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
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
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
};