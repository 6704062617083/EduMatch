"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function WalletPage() {
  const [income, setIncome] = useState(0);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/tutor/income")
      .then(res => res.json())
      .then(data => {
        setIncome(data.totalIncome || 0);
        setPayments(data.payments || []);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-orange-50 font-sans tracking-tight antialiased flex flex-col">
      <div className="flex items-center px-10 py-5 bg-[#FC5404] text-white shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/home/tutor">
            <img src="/Edu_icon.png" alt="Edumatch Logo" width={120} height={35} className="object-contain cursor-pointer" />
          </Link>
          <div className="h-6 w-[1px] bg-white/30 ml-2"></div>
          <span className="text-lg font-black tracking-tighter uppercase">กระเป๋าเงิน</span>
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto w-full">
        <Link href="/home/tutor">
          <button className="mb-6 px-5 py-2.5 rounded-2xl bg-white border border-orange-100 text-[#FC5404] text-sm font-black shadow-sm hover:shadow-md hover:bg-orange-50 transition-all active:scale-95 flex items-center gap-2">
            <span className="text-[#FC5404]">‹</span>
            ย้อนกลับ
          </button>
        </Link>

        <div className="bg-white border border-orange-100 rounded-[32px] p-8 shadow-sm mb-6">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-tighter mb-2">รายได้รวม</p>
          <p className="text-4xl font-black text-[#FC5404]">
            ฿{income.toLocaleString()}
          </p>
          <p className="text-sm text-gray-400 font-medium mt-1">บาท</p>
        </div>

        <div className="bg-white border border-orange-100 rounded-[32px] p-8 shadow-sm">
          <h2 className="text-2xl font-black text-[#1e3a5f] flex items-center gap-3 mb-6">
            ประวัติรายได้
            {!loading && (
              <span className="bg-orange-500 text-white text-sm px-2.5 py-0.5 rounded-full">{payments.length}</span>
            )}
          </h2>

          {loading ? (
            <div className="text-center py-16 text-gray-300 font-bold">กำลังโหลด...</div>
          ) : payments.length === 0 ? (
            <div className="bg-white rounded-[32px] p-16 text-center border-2 border-orange-100 border-dashed text-gray-300 font-bold">
              ยังไม่มีรายได้
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((p: any) => (
                <div
                  key={p.id}
                  className="bg-white border border-orange-100 rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:ring-1 hover:ring-orange-200 transition-all duration-300"
                >
                  <div className="flex justify-between items-center">
                    <p className="text-base font-black text-[#1e3a5f]">{p.courseName}</p>
                    <p className="text-xl font-black text-green-500">+฿{p.amount.toLocaleString()}</p>
                  </div>
                  <p className="text-[11px] font-black text-gray-400 uppercase tracking-tighter mt-3">
                    {new Date(p.createdAt).toLocaleString("th-TH", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}