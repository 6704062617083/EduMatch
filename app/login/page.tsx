"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    console.log("LOGIN DATA:", data);

    if (res.ok) {
      localStorage.setItem("tutorId", data.userId);
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: data.name,
          surname: data.surname,
          _id: data.userId,
          role: data.role,
        })
      );

      if (data.role === "student") {
        router.push("/home/student");
      } else if (data.role === "tutor") {
        router.push("/home/tutor");
      } else if (data.role === "admin") {
        router.push("/home/admin");
      }

      setEmail("");
      setPassword("");
    } else {
      setPopupMessage("ล็อกอินไม่สำเร็จ");
      setShowPopup(true);
    }
  }

  return (
    <div style={{ padding: "100px", textAlign: "center" }}>
      <h1>Login</h1>

      <form onSubmit={handleLogin} style={{ maxWidth: "300px", margin: "0 auto" }}>
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
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={inputStyle}
        />

        <button type="submit" style={buttonStyle}>
          ล็อกอิน
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
              onClick={() => setShowPopup(false)}
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