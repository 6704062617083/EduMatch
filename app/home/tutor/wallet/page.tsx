"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
    <div className="min-h-screen bg-gray-100 px-16 py-10">
      <h1 className="text-xl font-semibold mb-8">รายได้ของฉัน</h1>
        <button onClick={() => router.push("/home/tutor")} className="text-black-500 hover:underline mt-2 mb-5">
            ← ย้อนกลับ
        </button>
        

      <div className="bg-white rounded-2xl shadow p-6 mb-8">
        <p className="text-sm text-gray-500">รายได้รวม</p>
        <p className="text-3xl font-semibold mt-2">
          {income.toLocaleString()} บาท
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow p-6">
        <p className="text-lg font-semibold mb-4">ประวัติรายได้</p>

        {loading ? (
          <p className="text-gray-500 text-sm">กำลังโหลด...</p>
        ) : payments.length === 0 ? (
          <p className="text-gray-500 text-sm">ยังไม่มีรายได้</p>
        ) : (
          <div className="space-y-4">
            {payments.map((p: any) => (
              <div
                key={p.id}
                className="bg-gray-50 rounded-xl p-4 shadow-sm"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm font-semibold">
                    {p.courseName}
                  </p>
                  <p className="text-green-600 font-semibold">
                    +{p.amount.toLocaleString()} บาท
                  </p>
                </div>

                <p className="text-xs text-gray-500 mt-2">
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
  );
}