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
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end justify-end p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-h-[640px] flex flex-col overflow-hidden">

        <div className="bg-indigo-700 text-white px-5 py-4 flex justify-between items-center shrink-0">
          <div>
            <p className="font-semibold text-base">ติดต่อ Support</p>
            <p className="text-xs opacity-70 mt-0.5">ทีมงานจะตอบกลับโดยเร็วที่สุด</p>
          </div>
          <button onClick={handleClose} className="opacity-70 hover:opacity-100 text-lg leading-none">✕</button>
        </div>

        {!selectedTicket && (
          <div className="flex border-b border-gray-200 shrink-0">
            <button
              onClick={() => setTab("send")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === "send" ? "border-b-2 border-indigo-700 text-indigo-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              📝 ส่ง Report
            </button>
            <button
              onClick={() => { setTab("mytickets"); fetchTickets(); }}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                tab === "mytickets" ? "border-b-2 border-indigo-700 text-indigo-700" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              💬 กระทู้ของฉัน {tickets.length > 0 && `(${tickets.length})`}
            </button>
          </div>
        )}

        {selectedTicket && (
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 shrink-0 bg-gray-50">
            <button onClick={() => setSelectedTicket(null)} className="text-gray-400 hover:text-gray-700 text-sm">
              ← กลับ
            </button>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{selectedTicket.subject}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full ${
                selectedTicket.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  หัวข้อปัญหา <span className="text-red-500">*</span>
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="เช่น ไม่สามารถจองคอร์สได้"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  รายละเอียด <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={6}
                  placeholder="อธิบายปัญหาที่พบโดยละเอียด..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <button
                onClick={handleSend}
                disabled={sending}
                className="w-full py-2.5 bg-indigo-700 text-white rounded-xl text-sm font-medium hover:bg-indigo-800 disabled:opacity-50 transition-colors"
              >
                {sending ? "กำลังส่ง..." : "ส่ง Report"}
              </button>
            </div>
          )}

          {!selectedTicket && tab === "mytickets" && (
            <div className="p-4">
              {loading ? (
                <p className="text-center text-gray-400 py-10 text-sm">กำลังโหลด...</p>
              ) : tickets.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-400 text-sm">ยังไม่มีกระทู้</p>
                  <button onClick={() => setTab("send")} className="mt-3 text-indigo-600 text-sm hover:underline">
                    ส่ง Report แรกของคุณ →
                  </button>
                </div>
              ) : (
                tickets.map((ticket) => {
                  const lastMsg = ticket.messages[ticket.messages.length - 1];
                  return (
                    <div
                      key={ticket._id}
                      onClick={() => setSelectedTicket(ticket)}
                      className="border border-gray-200 rounded-xl p-3.5 mb-3 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <p className="font-semibold text-sm text-gray-800 flex-1 leading-snug">{ticket.subject}</p>
                        <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${
                          ticket.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        }`}>
                          {ticket.status === "open" ? "เปิด" : "ปิด"}
                        </span>
                      </div>
                      {lastMsg && (
                        <p className="text-xs text-gray-400 mt-1.5 truncate">{lastMsg.text}</p>
                      )}
                      <p className="text-xs text-gray-300 mt-1">
                        {ticket.messages.length} ข้อความ · {new Date(ticket.createdAt).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {selectedTicket && (
            <div className="p-4 flex flex-col gap-3">
              {selectedTicket.messages.map((msg, i) => {
                const isAdmin = msg.senderRole === "admin";
                return (
                  <div key={i} className={`flex ${isAdmin ? "justify-start" : "justify-end"}`}>
                    <div className={`max-w-[78%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                      isAdmin ? "bg-gray-100 text-gray-800 rounded-tl-sm" : "bg-indigo-700 text-white rounded-tr-sm"
                    }`}>
                      {isAdmin && <p className="text-xs font-bold text-indigo-600 mb-1">Admin</p>}
                      <p>{msg.text}</p>
                      <p className={`text-xs mt-1.5 ${isAdmin ? "text-gray-400" : "text-indigo-200"}`}>
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
          <div className="border-t border-gray-200 p-3 shrink-0">
            {selectedTicket.status === "closed" ? (
              <p className="text-center text-xs text-gray-400 py-1">กระทู้นี้ถูกปิดแล้ว</p>
            ) : (
              <div className="flex gap-2">
                <input
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleReply(); } }}
                  placeholder="พิมพ์ข้อความ..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                  onClick={handleReply}
                  className="px-4 py-2 bg-indigo-700 text-white rounded-lg text-sm hover:bg-indigo-800 transition-colors"
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