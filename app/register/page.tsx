"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [region, setRegion] = useState("+66");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "tutor" | "">("");

  const fullphone = region + phone.replace(/^0+/, "");

  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        surname,
        phone: fullphone,
        email,
        password,
        role,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      // สมัครสำเร็จ → ไปหน้า verify otp
      router.push(`/verify-otp?email=${email}&type=register`);
    } else {
      setPopupMessage("เกิดข้อผิดพลาด: " + data.message);
      setShowPopup(true);
    }
  };

  return (
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
      <form
        onSubmit={handleSubmit}
        style={{
          width: "800px",
          background: "white",
          padding: "40px",
          borderRadius: "15px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
          textAlign: "center",
          position: "relative",
        }}
      >
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
          EduMatch Sign Up
        </h1>

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

        <div style={{ marginBottom: "25px", textAlign: "center" }}>
          <p style={{ marginBottom: "10px", fontWeight: "bold" }}>
            สมัครเป็น
          </p>

          <button
            type="button"
            onClick={() => setRole("student")}
            style={{
              padding: "10px 25px",
              marginRight: "15px",
              borderRadius: "30px",
              border: role === "student" ? "2px solid #0070f3" : "1px solid #ccc",
              background: role === "student" ? "#0070f3" : "white",
              color: role === "student" ? "white" : "black",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            นักเรียน
          </button>

          <button
            type="button"
            onClick={() => setRole("tutor")}
            style={{
              padding: "10px 25px",
              borderRadius: "30px",
              border: role === "tutor" ? "2px solid #0070f3" : "1px solid #ccc",
              background: role === "tutor" ? "#0070f3" : "white",
              color: role === "tutor" ? "white" : "black",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            ติวเตอร์
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <input
            type="text"
            placeholder="ชื่อ"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="text"
            placeholder="นามสกุล"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
            style={inputStyle}
          />

          <input
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
          />

          <div style={{ display: "flex", gap: "10px" }}>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              }}
            >
              <option value="+66">🇹🇭 Thailand +66</option>
              <option value="+1">🇺🇸 USA +1</option>
              <option value="+44">🇬🇧 UK +44</option>
              <option value="+81">🇯🇵 Japan +81</option>
              <option value="+82">🇰🇷 Korea +82</option>
              <option value="+86">🇨🇳 China +86</option>
              <option value="+65">🇸🇬 Singapore +65</option>
              <option value="+60">🇲🇾 Malaysia +60</option>
              <option value="+84">🇻🇳 Vietnam +84</option>
              <option value="+61">🇦🇺 Australia +61</option>
            </select>

            <input
              type="tel"
              placeholder="เบอร์โทร"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, ""))
              }
              maxLength={10}
              required
              style={inputStyle}
            />
          </div>

          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ ...inputStyle, gridColumn: "span 2" }}
          />
        </div>

        <button
          type="submit"
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
          สมัครสมาชิก
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
  padding: "12px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "15px",
  width: "100%",
};