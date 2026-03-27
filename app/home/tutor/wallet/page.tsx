"use client";
import { useState, useEffect } from "react";

const THAI_BANKS = [
  { value: "kbank", label: "ธนาคารกสิกรไทย (KBank)" },
  { value: "scb", label: "ธนาคารไทยพาณิชย์ (SCB)" },
  { value: "bbl", label: "ธนาคารกรุงเทพ (BBL)" },
  { value: "ktb", label: "ธนาคารกรุงไทย (KTB)" },
  { value: "bay", label: "ธนาคารกรุงศรีอยุธยา (BAY)" },
  { value: "tmb", label: "ธนาคารทีเอ็มบีธนชาต (TTB)" },
  { value: "gsb", label: "ธนาคารออมสิน (GSB)" },
  { value: "baac", label: "ธนาคารเพื่อการเกษตรฯ (BAAC)" },
  { value: "uob", label: "ธนาคารยูโอบี (UOB)" },
  { value: "cimb", label: "ธนาคารซีไอเอ็มบี (CIMB)" },
  { value: "lhb", label: "ธนาคารแลนด์ แอนด์ เฮ้าส์ (LHB)" },
  { value: "ibank", label: "ธนาคารอิสลามแห่งประเทศไทย (IBANK)" },
];

export default function WalletPage() {
  const [type, setType] = useState("promptpay");
  const [number, setNumber] = useState("");
  const [bankName, setBankName] = useState(THAI_BANKS[0].value);
  const [income, setIncome] = useState(0);

  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/tutor/wallet")
      .then(res => res.json())
      .then(data => {
        if (data) {
          if (data.promptpayNumber) {
            setType("promptpay");
            setNumber(data.promptpayNumber);
          } else if (data.accountNumber) {
            setType("bank");
            setNumber(data.accountNumber);
            if (data.bankName) setBankName(data.bankName);
          }
          setIncome(data.totalEarned || 0);
          setSaved(true);
          setMessage("บันทึกแล้ว");
        }
      });
  }, []);

  async function handleSave() {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/tutor/wallet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        number,
        ...(type === "bank" && { bankName }),
      }),
    });

    setLoading(false);
    const data = await res.json();

    if (!res.ok) {
      setMessage(data.message || "บันทึกไม่สำเร็จ");
      return;
    }

    setSaved(true);
    setMessage("บันทึกแล้ว");
  }

  function handleEdit() {
    setSaved(false);
    setMessage("กำลังแก้ไข...");
  }

  function handleChange(e: any) {
    const value = e.target.value.replace(/\D/g, "").slice(0, 15);
    setNumber(value);
  }

  return (
    <div className="min-h-screen bg-gray-100 px-16 py-10">
      <h1 className="text-xl font-semibold mb-12">กระเป๋าตัง</h1>

      <div className="flex items-center justify-center gap-12">
        <div>
          <p className="text-sm text-gray-500 mb-1">รายได้รวม</p>
          <p className="text-2xl font-semibold">
            {income.toLocaleString()} บาท
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={saved}
            className="h-11 px-3 border border-gray-300 rounded-md bg-white text-sm outline-none disabled:bg-gray-100"
          >
            <option value="promptpay">PromptPay</option>
            <option value="bank">บัญชีธนาคาร</option>
          </select>

          {type === "bank" && (
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              disabled={saved}
              className="h-11 px-3 border border-gray-300 rounded-md bg-white text-sm outline-none disabled:bg-gray-100"
            >
              {THAI_BANKS.map((b) => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          )}

          <input
            type="text"
            value={number}
            onChange={handleChange}
            disabled={saved}
            className="w-60 h-11 px-4 border border-gray-300 rounded-md text-sm outline-none disabled:bg-gray-100"
            placeholder={type === "promptpay" ? "เบอร์โทร / เลขบัตรประชาชน" : "เลขบัญชี"}
          />

          {!saved ? (
            <button
              onClick={handleSave}
              disabled={loading}
              className="h-11 px-5 bg-black text-white rounded-md text-sm disabled:opacity-50"
            >
              {loading ? "..." : "บันทึก"}
            </button>
          ) : (
            <button
              onClick={handleEdit}
              className="h-11 px-5 bg-gray-700 text-white rounded-md text-sm"
            >
              แก้ไข
            </button>
          )}

          {message && (
            <span
              className={`text-sm ml-2 ${
                message === "บันทึกแล้ว"
                  ? "text-green-600"
                  : message === "กำลังแก้ไข..."
                  ? "text-yellow-600"
                  : "text-red-500"
              }`}
            >
              {message}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}