"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginUI from "@/components/LoginUI";

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

    if (res.ok) {
      if (data.role === "student") router.push("/home/student");
      else if (data.role === "tutor") router.push("/home/tutor");
      else if (data.role === "admin") router.push("/home/admin");

      setEmail("");
      setPassword("");
    } else {
      setPopupMessage("ล็อกอินไม่สำเร็จ");
      setShowPopup(true);
    }
  }

  return (
    <LoginUI
      email={email}
      password={password}
      setEmail={setEmail}
      setPassword={setPassword}
      handleLogin={handleLogin}
      showPopup={showPopup}
      popupMessage={popupMessage}
      setShowPopup={setShowPopup}
    />
  );
}