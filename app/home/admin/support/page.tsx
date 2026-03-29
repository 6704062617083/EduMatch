"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminSupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selected) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [selected?.messages?.length]);

  async function fetchTickets() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/support");
      const data = await res.json();
      setTickets(data);
    } catch {
      setTickets([]);
    }
    setLoading(false);
  }

  async function handleReply() {
    if (!reply.trim() || !selected) return;

    const res = await fetch("/api/admin/support", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticketId: selected._id, text: reply }),
    });

    if (res.ok) {
      const updated = await res.json();
      setSelected(updated);
      setReply("");
      setTickets((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 font-sans tracking-tight antialiased">
      <div className="flex items-center justify-between border-b border-[#ddd] bg-[#FC5404] px-10 py-5 text-[22px] font-extrabold tracking-tight">
        <button
          onClick={() => router.push("/home/admin")}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <Image
            src="/Edu_icon.png"
            alt="Edumatch Logo"
            width={140}
            height={40}
            style={{ cursor: "pointer", objectFit: "contain" }}
          />
        </button>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.push("/home/admin")}
            className="flex items-center gap-1.5 text-sm font-medium text-orange-500 border border-orange-200 bg-white hover:bg-orange-50 px-3 py-1.5 rounded-xl transition-all shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            ย้อนกลับ
          </button>
          <h1 className="text-2xl font-black text-[#1e3a5f] tracking-tight">คำร้องติดต่อ Support</h1>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm font-medium animate-pulse">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
            {tickets.map((t) => {
              const last = t.messages[t.messages.length - 1];
              return (
                <div
                  key={t._id}
                  onClick={() => setSelected(t)}
                  className="bg-white border border-orange-100 rounded-2xl p-5 cursor-pointer hover:border-orange-400 hover:shadow-md transition-all group"
                >
                  <p className="font-bold text-[15px] text-[#1e3a5f] truncate mb-1 group-hover:text-orange-600 transition-colors">
                    {t.subject}
                  </p>
                  <p className="text-xs text-gray-500 mb-3 font-medium">
                    {t.userId?.name} {t.userId?.surname}{" "}
                    <span className="text-orange-500 font-bold bg-orange-50 px-1.5 py-0.5 rounded">
                      {t.userId?.role}
                    </span>
                  </p>
                  <p className="text-[13px] text-gray-400 truncate leading-relaxed">{last?.text}</p>
                  <div className="mt-4 pt-3 border-t border-orange-50 flex justify-end">
                    <span className="text-[11px] font-bold text-gray-300 uppercase tracking-wider">
                      {new Date(last?.createdAt).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })} น.
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-[#1e3a5f]/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div className="bg-white rounded-[24px] w-full max-w-lg flex flex-col overflow-hidden shadow-2xl border border-white"
            style={{ maxHeight: "85vh" }}>
            <div className="px-6 py-5 border-b border-orange-50 flex items-start justify-between gap-3 bg-white">
              <div>
                <p className="font-black text-lg text-[#1e3a5f] leading-tight">{selected.subject}</p>
                <p className="text-xs font-medium text-gray-400 mt-1">
                  {selected.userId?.name} {selected.userId?.surname} <span className="mx-1 text-gray-200">|</span> {selected.userId?.email}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-50 hover:bg-orange-100 text-gray-400 hover:text-orange-500 transition-all"
              >
                <span className="text-lg leading-none">×</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-[#fdfbf9]">
              {selected.messages.map((msg: any, i: number) => {
                const isAdmin = msg.senderRole === "admin";
                return (
                  <div key={i} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] px-4 py-2.5 shadow-sm ${
                        isAdmin
                          ? "bg-orange-500 text-white rounded-2xl rounded-tr-none font-medium"
                          : "bg-white text-gray-700 border border-orange-100 rounded-2xl rounded-tl-none font-medium"
                      }`}
                    >
                      <p className="leading-relaxed text-[14px]">{msg.text}</p>
                      <p className={`text-[10px] mt-1.5 font-bold uppercase tracking-wide ${isAdmin ? "text-orange-100" : "text-gray-300"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString("th-TH", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            <div className="p-4 border-t border-orange-50 flex gap-2 bg-white">
              <input
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleReply();
                  }
                }}
                placeholder="พิมพ์ข้อความตอบกลับ..."
                className="flex-1 border border-gray-100 bg-gray-50 rounded-2xl px-4 py-3 text-[14px] font-medium outline-none focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all placeholder:text-gray-300"
              />
              <button
                onClick={handleReply}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 rounded-2xl text-[14px] font-bold shadow-md shadow-orange-200 active:scale-95 transition-all"
              >
                ส่ง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}