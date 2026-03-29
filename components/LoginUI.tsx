"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginUI({
  email,
  password,
  setEmail,
  setPassword,
  handleLogin,
  showPopup,
  popupMessage,
  setShowPopup,
}: any) {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-orange-50 p-20">
      <Image 
          src="/Asset 5.png" 
          alt="Edumatch Logo" 
          width={240}
          height={240}
          className="mb-6"
        />
        <h1 className="text-3xl font-bold mb-10">Welcome to Edumatch</h1>
      <div className="w-[420px] bg-white p-10 rounded-[30px] shadow-lg text-center relative">

        <h1 className="text-2xl font-bold mb-6">Sign In</h1>

        <form onSubmit={handleLogin} className="max-w-[300px] mx-auto">

          <input
            type="email"
            placeholder="อีเมล"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 rounded-full bg-gray-100 border border-gray-200"
            required
          />

          <input
            type="password"
            placeholder="รหัสผ่าน"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 rounded-full bg-gray-100 border border-gray-200"
            required
          />

          <button
            type="submit"
            className="w-full p-2 bg-[#FF5A00] text-white rounded-full hover:bg-[#E65100] transition"
          >
            เข้าสู่ระบบ
          </button>

          <p className="mt-3 text-right text-xs">
            <a href="/forgotpassword" className="text-gray-500">
              ลืมรหัสผ่าน?
            </a>
          </p>

          <div className="border-t border-gray-300 my-3"></div>

          <button
            onClick={() => router.push("/register")}
            className="mt-3 w-full p-2 bg-[#F4A261] text-white rounded-full hover:bg-[#E5944D] transition"
          >
            ยังไม่มีบัญชีใช่ไหม? มาสมัครสิ
          </button>

        </form>
      </div>

      {showPopup && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-8 rounded-xl text-center min-w-[300px]">
            <h2>{popupMessage}</h2>

            <button
              onClick={() => setShowPopup(false)}
              className="mt-4 px-5 py-2 bg-blue-500 text-white rounded"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}