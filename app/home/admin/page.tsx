"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminHome() {
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me")
      .then(res => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => { window.location.href = "/login"; });
  }, []);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{
        padding: "20px 40px",
        fontSize: "22px",
        fontWeight: "bold",
        borderBottom: "1px solid #ddd",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span>แอดมิน</span>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "16px", fontWeight: "normal" }}>
            {user?.name} {user?.surname}
          </span>

          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "2px solid black",
                cursor: "pointer",
              }}
            />
            <div style={{ fontSize: "12px", marginTop: "4px" }}>{user?.role}</div>

            {showMenu && (
              <div style={{
                position: "absolute",
                top: "60px",
                right: "0",
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              }}>
                <button
                  onClick={handleLogout}
                  style={{
                    background: "#ff4d4f",
                    color: "white",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: "flex", flex: 1 }}>

        <div style={{ flex: 1, padding: "40px" }}>
          <h2>ยินดีต้อนรับ Admin</h2>
        </div>

        {/* Sidebar */}
        <div style={{
          width: "250px",
          padding: "40px 60px 40px 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
        }}>
          <button
            onClick={() => router.push("/home/admin/request")}
            style={{ ...btnStyle, marginTop: "30px" }}
          >
            คำขอยืนยันติวเตอร์
          </button>
        </div>

      </div>
    </div>
  );
}

const btnStyle = {
  padding: "8px 20px",
  background: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};