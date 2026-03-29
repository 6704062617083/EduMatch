"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Booking {
  _id: string;
  bookingId: string;
  courseTitle: string;
  startTime: string | null;
  endTime: string | null;
  price: number;
  status: "pending" | "waiting_payment" | "confirmed" | "cancelled" | "completed";
  paymentStatus: string;
  createdAt: string;
  classLink?: string;
  tutorId?: string;
}

const MONTH_TH = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
];
const DAY_TH = ["อา","จ","อ","พ","พฤ","ศ","ส"];

const statusLabel: Record<string, { text: string; cls: string }> = {
  pending:         { text: "รอการยืนยัน",   cls: "bg-yellow-50 text-yellow-600 border-yellow-100" },
  waiting_payment: { text: "รอชำระเงิน",    cls: "bg-blue-50 text-blue-600 border-blue-100" },
  confirmed:       { text: "ยืนยันแล้ว",    cls: "bg-green-50 text-green-600 border-green-100" },
  cancelled:       { text: "ยกเลิก",        cls: "bg-red-50 text-red-600 border-red-100" },
  completed:       { text: "จบคอร์สแล้ว",   cls: "bg-orange-50 text-orange-500 border-orange-100" },
};

function formatDate(iso: string | null) {
  if (!iso) return "ยังไม่ระบุ";
  const d = new Date(iso);
  return `${d.getDate()} ${MONTH_TH[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function formatTime(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function isFinished(b: Booking): boolean {
  if (b.status === "cancelled") return false;
  if (b.status === "completed") return true;
  if (b.endTime) {
    const endPlus1h = new Date(new Date(b.endTime).getTime() + 60 * 60 * 1000);
    if (endPlus1h < new Date()) return true;
  }
  return false;
}

async function patchCompletedIfNeeded(b: Booking) {
  if (b.status !== "completed" && isFinished(b)) {
    try {
      await fetch(`/api/studentbooking/${b.bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });
    } catch (e) {
      console.error("patch completed failed", e);
    }
  }
}

function RatingPopup({
  booking,
  onClose,
  onConfirm,
  loading,
}: {
  booking: Booking;
  onClose: () => void;
  onConfirm: (rating: number, comment: string) => void;
  loading: boolean;
}) {
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState("");

  const stars = [1, 2, 3, 4, 5];
  const display = hovered || selected;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-sm p-8 flex flex-col items-center gap-5 border border-orange-100">
        <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-3xl">
          🎓
        </div>

        <div className="text-center">
          <h2 className="text-xl font-black text-[#1e3a5f]">จบคอร์สแล้ว!</h2>
          <p className="text-sm text-gray-400 font-medium mt-1 leading-relaxed">
            ให้คะแนนติวเตอร์สำหรับคอร์ส
            <br />
            <span className="font-black text-[#1e3a5f]">{booking.courseTitle}</span>
          </p>
        </div>

        <div className="flex gap-2">
          {stars.map((s) => (
            <button
              key={s}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              onClick={() => setSelected(s)}
              className="text-3xl transition-transform hover:scale-110 focus:outline-none"
              aria-label={`${s} ดาว`}
            >
              <span className={s <= display ? "text-amber-400" : "text-gray-200"}>★</span>
            </button>
          ))}
        </div>

        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider h-4">
          {display === 0 && "แตะดาวเพื่อให้คะแนน"}
          {display === 1 && "ต้องปรับปรุง"}
          {display === 2 && "พอใช้"}
          {display === 3 && "ดี"}
          {display === 4 && "ดีมาก"}
          {display === 5 && "ยอดเยี่ยม!"}
        </p>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="ความคิดเห็นเพิ่มเติม (ไม่บังคับ)"
          rows={2}
          className="w-full text-sm border border-orange-100 bg-orange-50/50 rounded-2xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-orange-300 text-[#1e3a5f] font-bold placeholder:text-gray-300 transition-all"
        />

        <div className="flex gap-3 w-full">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3.5 rounded-2xl border border-orange-100 text-sm font-bold text-[#1e3a5f] hover:bg-orange-50 transition-all disabled:opacity-50 active:scale-95"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => selected > 0 && onConfirm(selected, comment)}
            disabled={selected === 0 || loading}
            className={[
              "flex-1 py-3.5 rounded-2xl text-sm font-black transition-all active:scale-95",
              selected > 0 && !loading
                ? "bg-[#FC5404] hover:bg-orange-600 text-white shadow-lg shadow-orange-100"
                : "bg-gray-100 text-gray-300 cursor-not-allowed",
            ].join(" ")}
          >
            {loading ? "กำลังบันทึก..." : "ยืนยันจบคอร์ส"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Calendar({
  bookings,
  selectedDate,
  onSelect,
}: {
  bookings: Booking[];
  selectedDate: Date | null;
  onSelect: (d: Date) => void;
}) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const bookedDates = useMemo(() =>
    bookings
      .filter((b) => b.startTime && b.status !== "cancelled")
      .map((b) => new Date(b.startTime!)),
    [bookings]
  );

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  return (
    <div className="bg-white rounded-[28px] border border-orange-100 p-6 mb-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={prevMonth}
          className="w-9 h-9 rounded-2xl border border-orange-100 flex items-center justify-center text-[#1e3a5f] hover:bg-orange-50 transition-all font-black active:scale-95"
        >
          ‹
        </button>
        <span className="text-sm font-black text-[#1e3a5f]">{MONTH_TH[viewMonth]} {viewYear + 543}</span>
        <button
          onClick={nextMonth}
          className="w-9 h-9 rounded-2xl border border-orange-100 flex items-center justify-center text-[#1e3a5f] hover:bg-orange-50 transition-all font-black active:scale-95"
        >
          ›
        </button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAY_TH.map((d) => (
          <div key={d} className="text-[10px] font-black text-gray-400 uppercase tracking-wider py-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const cellDate = new Date(viewYear, viewMonth, day);
          const hasBooking = bookedDates.some((bd) => isSameDay(bd, cellDate));
          const isToday = isSameDay(cellDate, today);
          const isSelected = selectedDate && isSameDay(cellDate, selectedDate);
          return (
            <button
              key={day}
              onClick={() => onSelect(cellDate)}
              className={[
                "relative flex flex-col items-center py-2 rounded-xl text-sm transition-all active:scale-95",
                isSelected
                  ? "bg-[#FC5404] text-white font-black shadow-md shadow-orange-100"
                  : isToday
                  ? "text-[#FC5404] font-black hover:bg-orange-50"
                  : "text-[#1e3a5f] font-bold hover:bg-orange-50",
              ].join(" ")}
            >
              {day}
              {hasBooking && (
                <span className={["w-1 h-1 rounded-full mt-0.5", isSelected ? "bg-white" : "bg-orange-400"].join(" ")} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function BookingCard({ b, onCompleteClick }: { b: Booking; onCompleteClick?: (b: Booking) => void }) {
  const finished = isFinished(b);
  const displayStatus = finished
    ? "completed"
    : b.paymentStatus === "paid"
    ? "confirmed"
    : b.status;
  const now = new Date();
  const canJoin =
    b.startTime &&
    new Date(b.startTime).getTime() - 10 * 60 * 1000 <= now.getTime();
  const start = b.startTime ? new Date(b.startTime) : null;
  const diffMs = start ? start.getTime() - now.getTime() : null;
  const diffHour = diffMs ? Math.floor(diffMs / (1000 * 60 * 60)) : null;
  const diffMin = diffMs ? Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)) : null;
  const st = statusLabel[displayStatus] ?? { text: displayStatus, cls: "bg-gray-50 text-gray-400 border-gray-100" };

  return (
    <div className={[
      "bg-white border rounded-[24px] px-5 py-4 mb-3 transition-all",
      finished ? "border-orange-50 opacity-60" : "border-orange-100 hover:shadow-md hover:ring-1 hover:ring-orange-200",
    ].join(" ")}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-black text-[#1e3a5f] text-[15px] truncate leading-tight">{b.courseTitle || "คอร์ส"}</p>
          <p className="text-[11px] font-bold text-gray-400 mt-1 uppercase tracking-wide">
            {b.startTime
              ? `${formatDate(b.startTime)} · ${formatTime(b.startTime)}–${formatTime(b.endTime)}`
              : "ยังไม่ระบุวันเวลา"}
          </p>
          <p className="text-sm font-black text-orange-500 mt-1">฿{b.price?.toLocaleString() ?? "–"}</p>
          {!finished && b.classLink && canJoin && (
            <a 
              href={b.classLink}
              target="_blank"
              className="text-xs font-bold text-[#FC5404] underline mt-1 inline-block"
            >
              เข้าเรียนออนไลน์ →
            </a>
          )}
          {!finished && b.classLink && !canJoin && diffMin !== null && diffMin > 0 && (
            <span className="text-[11px] font-bold text-gray-400 mt-1 inline-block">
              เข้าเรียนได้ในอีก{" "}
              {diffHour && diffHour > 0 && `${diffHour} ชม. `}
              {diffMin} นาที
            </span>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`text-[10px] font-extrabold px-3 py-1 rounded-xl border uppercase tracking-wider ${st.cls}`}>
            {st.text}
          </span>
          {!finished && (b.status === "confirmed" || b.paymentStatus === "paid") && onCompleteClick && (
            <button
              onClick={() => onCompleteClick(b)}
              className="text-xs font-black px-3 py-2 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-100 active:scale-95 transition-all"
            >
              จบคอร์ส
            </button>
          )}
        </div>
      </div>
      {finished && (
        <p className="text-[11px] font-bold text-gray-400 mt-3 flex items-center gap-1 border-t border-orange-50 pt-3">
          <span>✓</span> คอร์สนี้เสร็จสิ้นแล้ว · ไม่สามารถดำเนินการใดได้
        </p>
      )}
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-16 border-2 border-dashed border-orange-100 rounded-[28px] text-gray-300">
      <div className="text-3xl mb-2">{icon}</div>
      <p className="text-sm font-bold">{text}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="min-h-screen bg-orange-50 p-8 animate-pulse">
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="h-8 bg-orange-100 rounded-2xl w-1/3" />
        <div className="h-72 bg-white rounded-[28px] border border-orange-100" />
        <div className="h-16 bg-white rounded-[24px] border border-orange-100" />
        <div className="h-16 bg-white rounded-[24px] border border-orange-100" />
      </div>
    </div>
  );
}

export default function StudentMySchedule() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tab, setTab] = useState<"upcoming" | "completed">("upcoming");

  const [popupBooking, setPopupBooking] = useState<Booking | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [studentId, setStudentId] = useState<string>("");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) { router.push("/login"); return; }
        const user = await res.json();
        setStudentId(user._id);

        const r = await fetch(`/api/studentbooking?studentId=${user._id}`);
        const data = await r.json();
        const list: Booking[] = Array.isArray(data)
          ? data.map((b: any) => ({
              ...b,
              status: b.bookingStatus,
              courseTitle: b.courseTitle || "คอร์ส",
              startTime: b.startTime || null,
              endTime: b.endTime || null,
              classLink: b.classLink || "",
            }))
          : [];

        setBookings(list);
        list.forEach((b) => patchCompletedIfNeeded(b));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [router]);

  const upcoming = useMemo(() =>
    bookings.filter((b) => b.status !== "cancelled" && !isFinished(b)), [bookings]);

  const completed = useMemo(() =>
    bookings.filter((b) => b.status !== "cancelled" && isFinished(b)), [bookings]);

  const filterByDate = (list: Booking[]) => {
    if (!selectedDate) return list;
    return list.filter((b) => b.startTime && isSameDay(new Date(b.startTime), selectedDate));
  };

  const activeList = filterByDate(tab === "upcoming" ? upcoming : completed);

  const handleConfirmComplete = async (rating: number, comment: string) => {
    if (!popupBooking) return;

    const payload = {
      bookingId: popupBooking.bookingId,
      tutorId: popupBooking.tutorId,
      studentId,
      rating,
      comment,
    };

    setSubmitLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        alert(err.error ?? "เกิดข้อผิดพลาด");
        return;
      }

      setBookings((prev) =>
        prev.map((b) =>
          b._id === popupBooking._id ? { ...b, status: "completed" } : b
        )
      );

      setPopupBooking(null);
    } catch (e) {
      console.error(e);
      alert("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <Skeleton />;

  return (
    <>
      {popupBooking && (
        <RatingPopup
          booking={popupBooking}
          onClose={() => !submitLoading && setPopupBooking(null)}
          onConfirm={handleConfirmComplete}
          loading={submitLoading}
        />
      )}

      <div className="min-h-screen bg-orange-50 font-sans tracking-tight antialiased flex flex-col">
        <div className="flex items-center px-10 py-5 bg-[#FC5404] text-white shadow-md">
          <div className="flex items-center gap-4">
            <Link href="/home/student">
              <Image 
                src="/Edu_icon.png" 
                alt="Edumatch Logo" 
                width={120} 
                height={35} 
                className="object-contain cursor-pointer" 
              />
            </Link>
            <div className="h-6 w-[1px] bg-white/30"></div>
            <span className="text-lg font-black tracking-tighter uppercase text-white">ตารางเรียนของฉัน</span>
          </div>
        </div>

        <div className="w-full pb-12">
          <div className="px-10 mt-8 mb-6">
            <button
              onClick={() => router.push("/home/student")}
              className="bg-white hover:bg-orange-50 text-[#FC5404] px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border border-orange-100 shadow-sm active:scale-95 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
              ย้อนกลับ
            </button>
          </div>

          <div className="max-w-2xl mx-auto px-6">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">ดูคอร์สที่จองไว้ทั้งหมด</p>

            <Calendar 
              bookings={bookings} 
              selectedDate={selectedDate} 
              onSelect={(d) => setSelectedDate((prev) => (prev && isSameDay(prev, d) ? null : d))} 
            />

            {selectedDate && (
              <div className="flex items-center gap-2 text-sm mb-4">
                <span className="font-bold text-[#1e3a5f]">วันที่ {formatDate(selectedDate.toISOString())}</span>
                <button onClick={() => setSelectedDate(null)} className="text-[#FC5404] font-black hover:underline">ล้าง</button>
              </div>
            )}

            <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-orange-100 shadow-sm mb-6">
              {(["upcoming", "completed"] as const).map((t) => {
                const count = filterByDate(t === "upcoming" ? upcoming : completed).length;
                const label = t === "upcoming" ? "กำลังมาถึง" : "เรียนจบแล้ว";
                return (
                  <button 
                    key={t} 
                    onClick={() => setTab(t)} 
                    className={[
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95", 
                      tab === t ? "bg-[#FC5404] text-white shadow-md shadow-orange-100" : "text-gray-400 hover:text-[#1e3a5f]"
                    ].join(" ")}
                  >
                    {label}
                    <span className={[
                      "text-[10px] px-1.5 py-0.5 rounded-lg font-black", 
                      tab === t ? "bg-white/20 text-white" : "bg-orange-50 text-orange-400"
                    ].join(" ")}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {activeList.length === 0 ? (
              tab === "upcoming" ? <EmptyState icon="" text="ไม่มีคอร์สที่กำลังมาถึง" /> : <EmptyState icon="" text="ยังไม่มีคอร์สที่เรียนจบ" />
            ) : (
              activeList.map((b) => (
                <BookingCard 
                  key={b._id} 
                  b={b} 
                  onCompleteClick={tab === "upcoming" ? setPopupBooking : undefined} 
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}