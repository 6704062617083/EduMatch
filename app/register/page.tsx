"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
      router.push(`/verify-otp?email=${email}&type=register`);
    } else {
      setPopupMessage("เกิดข้อผิดพลาด: " + data.message);
      setShowPopup(true);
    }
  };

  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center px-4 font-sans tracking-tight antialiased">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Image
            src="/Asset 5.png"
            alt="Edumatch Logo"
            width={160}
            height={160}
            className="mx-auto mb-2 object-contain"
          />
          <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-widest">สมัครสมาชิก</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-[32px] border border-orange-100 shadow-sm p-8 relative"
        >
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="absolute top-6 left-6 bg-orange-50 hover:bg-orange-100 text-[#FC5404] px-4 py-2 rounded-2xl text-sm font-bold transition-all border border-orange-100 active:scale-95 flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            ย้อนกลับ
          </button>

          <div className="mt-8 mb-7 text-center">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4">สมัครเป็น</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setRole("student")}
                className={[
                  "px-6 py-2.5 rounded-2xl text-sm font-black border transition-all active:scale-95",
                  role === "student"
                    ? "bg-[#FC5404] text-white border-[#FC5404] shadow-md shadow-orange-100"
                    : "bg-white text-[#1e3a5f] border-orange-100 hover:bg-orange-50",
                ].join(" ")}
              >
                นักเรียน
              </button>
              <button
                type="button"
                onClick={() => setRole("tutor")}
                className={[
                  "px-6 py-2.5 rounded-2xl text-sm font-black border transition-all active:scale-95",
                  role === "tutor"
                    ? "bg-[#FC5404] text-white border-[#FC5404] shadow-md shadow-orange-100"
                    : "bg-white text-[#1e3a5f] border-orange-100 hover:bg-orange-50",
                ].join(" ")}
              >
                ติวเตอร์
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="ชื่อ"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputCls}
            />

            <input
              type="text"
              placeholder="นามสกุล"
              value={surname}
              onChange={(e) => setSurname(e.target.value)}
              required
              className={inputCls}
            />

            <input
              type="email"
              placeholder="อีเมล"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputCls}
            />

            <div className="flex gap-2">
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="px-3 py-3 rounded-2xl border border-orange-100 bg-orange-50/50 text-sm font-bold text-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
              >
                <option value="+66">🇹🇭 +66</option>
                <option value="+1">🇺🇸 +1</option>
                <option value="+44">🇬🇧 +44</option>
                <option value="+81">🇯🇵 +81</option>
                <option value="+82">🇰🇷 +82</option>
                <option value="+86">🇨🇳 +86</option>
                <option value="+65">🇸🇬 +65</option>
                <option value="+60">🇲🇾 +60</option>
                <option value="+84">🇻🇳 +84</option>
                <option value="+61">🇦🇺 +61</option>
              </select>

              <input
                type="tel"
                placeholder="เบอร์โทร"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                maxLength={10}
                required
                className={inputCls + " flex-1"}
              />
            </div>

            <input
              type="password"
              placeholder="รหัสผ่าน"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputCls + " col-span-2"}
            />
          </div>

          <button
            type="submit"
            className="w-full mt-6 py-4 bg-[#FC5404] hover:bg-orange-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-orange-100 transition-all active:scale-95"
          >
            สมัครสมาชิก
          </button>

          <p className="text-center text-sm font-bold text-gray-400 mt-5">
            มีบัญชีอยู่แล้ว?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-[#FC5404] font-black hover:underline"
            >
              เข้าสู่ระบบ
            </button>
          </p>
        </form>
      </div>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5 border border-orange-100">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <p className="text-sm font-bold text-[#1e3a5f] text-center leading-relaxed">{popupMessage}</p>
            <button
              onClick={() => setShowPopup(false)}
              className="w-full py-3.5 rounded-2xl bg-[#FC5404] hover:bg-orange-600 text-white text-sm font-black shadow-lg shadow-orange-100 transition-all active:scale-95"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-3 rounded-2xl border border-orange-100 bg-orange-50/50 text-sm font-bold text-[#1e3a5f] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all";