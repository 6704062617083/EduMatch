"use client";
import { useState, useEffect, useRef } from "react";

interface IMessage {
  senderId: string;
  senderRole: "student" | "tutor" | "admin";
  text: string;
  createdAt: string;
}

interface ITicket {
  _id: string;
  subject: string;
  messages: IMessage[];
  status: "open" | "closed";
  createdAt: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SupportModal({ open, onClose }: Props) {
  const [tab, setTab] = useState<"send" | "mytickets">("send");
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ITicket | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [replyText, setReplyText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) fetchTickets();
  }, [open]);

  useEffect(() => {
    if (selectedTicket) {
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }, [selectedTicket?.messages.length]);

  async function fetchTickets() {
    setLoading(true);
    try {
      const res = await fetch("/api/support/tickets");
      const data = await res.json();
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      setTickets([]);
    }
    setLoading(false);
  }

  async function handleSend() {
    if (!subject.trim() || !text.trim()) return alert("กรุณากรอกข้อมูลให้ครบ");
    setSending(true);
    try {
      const res = await fetch("/api/support/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, text }),
      });
      if (res.ok) {
        setSubject("");
        setText("");
        await fetchTickets();
        setTab("mytickets");
        alert("ส่ง Report สำเร็จแล้ว!");
      } else {
        const d = await res.json();
        alert(d.message || "เกิดข้อผิดพลาด");
      }
    } catch {
      alert("เกิดข้อผิดพลาด");
    }
    setSending(false);
  }

  async function handleReply() {
    if (!replyText.trim() || !selectedTicket) return;
    try {
      const res = await fetch(`/api/support/tickets/${selectedTicket._id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: replyText }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSelectedTicket(updated);
        setReplyText("");
        setTickets((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      }
    } catch {
      alert("เกิดข้อผิดพลาด");
    }
  }

  function handleClose() {
    onClose();
    setSelectedTicket(null);
    setTab("send");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end justify-end p-6">
      <div className="bg-white rounded-[28px] shadow-2xl w-[420px] max-h-[640px] flex flex-col overflow-hidden border border-orange-100">

        <div className="bg-[#FC5404] text-white px-6 py-4 flex justify-between items-center shrink-0">
          <div>
            <p className="font-black text-base tracking-tight">ติดต่อ Support</p>
            <p className="text-[11px] text-white/70 font-medium mt-0.5">ทีมงานจะตอบกลับโดยเร็วที่สุด</p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white font-black text-sm transition-all active:scale-95"
          >
            ✕
          </button>
        </div>

        {!selectedTicket && (
          <div className="flex border-b border-orange-100 shrink-0 bg-orange-50/50">
            <button
              onClick={() => setTab("send")}
              className={`flex-1 py-3 text-sm font-black tracking-tight transition-colors ${
                tab === "send"
                  ? "border-b-2 border-[#FC5404] text-[#FC5404]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              ส่ง Report
            </button>
            <button
              onClick={() => { setTab("mytickets"); fetchTickets(); }}
              className={`flex-1 py-3 text-sm font-black tracking-tight transition-colors ${
                tab === "mytickets"
                  ? "border-b-2 border-[#FC5404] text-[#FC5404]"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              กระทู้ของฉัน{tickets.length > 0 && (
                <span className="ml-1.5 bg-[#FC5404] text-white text-[10px] px-1.5 py-0.5 rounded-full">{tickets.length}</span>
              )}
            </button>
          </div>
        )}

        {selectedTicket && (
          <div className="flex items-center gap-3 px-5 py-3 border-b border-orange-100 shrink-0 bg-orange-50/40">
            <button
              onClick={() => setSelectedTicket(null)}
              className="text-[#FC5404] hover:text-orange-700 text-sm font-black transition-colors"
            >
              ← กลับ
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-black text-[#1e3a5f] text-sm truncate leading-tight">{selectedTicket.subject}</p>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg uppercase tracking-wider border ${
                selectedTicket.status === "open"
                  ? "bg-green-50 text-green-600 border-green-100"
                  : "bg-gray-50 text-gray-400 border-gray-100"
              }`}>
                {selectedTicket.status === "open" ? "เปิดอยู่" : "ปิดแล้ว"}
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {!selectedTicket && tab === "send" && (
            <div className="p-5 flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1.5">
                  หัวข้อปัญหา <span className="text-red-400">*</span>
                </p>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="เช่น ไม่สามารถจองคอร์สได้"
                  className="w-full px-4 py-3 rounded-2xl border border-orange-100 bg-orange-50/50 text-sm font-bold text-[#1e3a5f] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
                />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-1.5">
                  รายละเอียด <span className="text-red-400">*</span>
                </p>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  placeholder="อธิบายปัญหาที่พบโดยละเอียด..."
                  className="w-full px-4 py-3 rounded-2xl border border-orange-100 bg-orange-50/50 text-sm font-bold text-[#1e3a5f] placeholder:text-gray-300 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={sending}
                className="w-full py-3.5 bg-[#FC5404] hover:bg-orange-600 text-white rounded-2xl text-sm font-black shadow-lg shadow-orange-100 disabled:opacity-50 transition-all active:scale-95"
              >
                {sending ? "กำลังส่ง..." : "ส่ง Report"}
              </button>
            </div>
          )}

          {!selectedTicket && tab === "mytickets" && (
            <div className="p-4">
              {loading ? (
                <div className="flex flex-col items-center py-10 text-orange-300">
                  <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-3"></div>
                  <p className="font-bold animate-pulse text-sm">กำลังโหลด...</p>
                </div>
              ) : tickets.length === 0 ? (
                <div className="text-center py-10 border-2 border-orange-100 border-dashed rounded-[24px]">
                  <p className="text-gray-300 font-bold text-sm mb-2">ยังไม่มีกระทู้</p>
                  <button
                    onClick={() => setTab("send")}
                    className="text-[#FC5404] text-sm font-black hover:underline"
                  >
                    ส่ง Report แรกของคุณ →
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => {
                    const lastMsg = ticket.messages[ticket.messages.length - 1];
                    return (
                      <div
                        key={ticket._id}
                        onClick={() => setSelectedTicket(ticket)}
                        className="bg-white border border-orange-100 rounded-[20px] p-4 cursor-pointer hover:shadow-md hover:ring-1 hover:ring-orange-200 transition-all"
                      >
                        <div className="flex justify-between items-start gap-2 mb-1.5">
                          <p className="font-black text-sm text-[#1e3a5f] flex-1 leading-snug">{ticket.subject}</p>
                          <span className={`shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-lg uppercase tracking-wider border ${
                            ticket.status === "open"
                              ? "bg-green-50 text-green-600 border-green-100"
                              : "bg-gray-50 text-gray-400 border-gray-100"
                          }`}>
                            {ticket.status === "open" ? "เปิด" : "ปิด"}
                          </span>
                        </div>
                        {lastMsg && (
                          <p className="text-xs text-gray-400 font-medium truncate">{lastMsg.text}</p>
                        )}
                        <p className="text-[10px] text-gray-300 font-bold mt-1.5 uppercase tracking-wider">
                          {ticket.messages.length} ข้อความ · {new Date(ticket.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {selectedTicket && (
            <div className="p-4 flex flex-col gap-3">
              {selectedTicket.messages.map((msg, i) => {
                const isAdmin = msg.senderRole === "admin";
                return (
                  <div key={i} className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isAdmin
                        ? "bg-orange-50 border border-orange-100 text-[#1e3a5f] rounded-tl-sm"
                        : "bg-[#FC5404] text-white rounded-tr-sm shadow-md shadow-orange-100"
                    }`}>
                      {isAdmin && (
                        <p className="text-[10px] font-black text-orange-500 uppercase tracking-wider mb-1">Admin</p>
                      )}
                      <p className="font-medium">{msg.text}</p>
                      <p className={`text-[10px] mt-1.5 font-bold ${isAdmin ? "text-gray-400" : "text-orange-200"}`}>
                        {new Date(msg.createdAt).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {selectedTicket && (
          <div className="border-t border-orange-100 p-3 shrink-0 bg-orange-50/30">
            {selectedTicket.status === "closed" ? (
              <p className="text-center text-[11px] font-bold text-gray-400 py-1 uppercase tracking-wider">กระทู้นี้ถูกปิดแล้ว</p>
            ) : (
              <div className="flex gap-2">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                  placeholder="พิมพ์ข้อความ..."
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-orange-100 bg-white text-sm font-bold text-[#1e3a5f] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
                />
                <button
                  onClick={handleReply}
                  className="px-4 py-2.5 bg-[#FC5404] hover:bg-orange-600 text-white rounded-2xl text-sm font-black shadow-md shadow-orange-100 transition-all active:scale-95"
                >
                  ส่ง
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}