"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

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
  pending:         { text: "รอการยืนยัน",  cls: "bg-amber-100 text-amber-700" },
  waiting_payment: { text: "รอชำระเงิน",   cls: "bg-blue-100 text-blue-700" },
  confirmed:       { text: "ยืนยันแล้ว",   cls: "bg-green-100 text-green-700" },
  cancelled:       { text: "ยกเลิก",       cls: "bg-red-100 text-red-700" },
  completed:       { text: "จบคอร์สแล้ว",  cls: "bg-purple-100 text-purple-700" },
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
      await fetch(`/api/studentbooking/${b._id}`, {
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 flex flex-col items-center gap-4">
        <div className="w-14 h-14 bg-purple-50 rounded-full flex items-center justify-center text-3xl">
          🎓
        </div>

        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-900">จบคอร์สแล้ว!</h2>
          <p className="text-sm text-gray-500 mt-1 leading-relaxed">
            ให้คะแนนติวเตอร์สำหรับคอร์ส
            <br />
            <span className="font-semibold text-gray-700">{booking.courseTitle}</span>
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

        <p className="text-xs text-gray-400 h-4">
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
          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300 text-gray-700 placeholder-gray-300"
        />

        <div className="flex gap-2 w-full mt-1">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            ยกเลิก
          </button>
          <button
            onClick={() => selected > 0 && onConfirm(selected, comment)}
            disabled={selected === 0 || loading}
            className={[
              "flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors",
              selected > 0 && !loading
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-100 text-gray-400 cursor-not-allowed",
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
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">‹</button>
        <span className="text-sm font-semibold text-gray-800">{MONTH_TH[viewMonth]} {viewYear + 543}</span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">›</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {DAY_TH.map((d) => (
          <div key={d} className="text-xs text-gray-400 font-medium py-1">{d}</div>
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
                "relative flex flex-col items-center py-1.5 rounded-lg text-sm transition-colors",
                isSelected ? "bg-indigo-600 text-white font-semibold"
                  : isToday ? "text-indigo-600 font-bold hover:bg-gray-50"
                  : "text-gray-700 hover:bg-gray-50",
              ].join(" ")}
            >
              {day}
              {hasBooking && (
                <span className={["w-1 h-1 rounded-full mt-0.5", isSelected ? "bg-white" : "bg-amber-400"].join(" ")} />
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
  const displayStatus = finished ? "completed" : b.status;
  const st = statusLabel[displayStatus] ?? { text: displayStatus, cls: "bg-gray-100 text-gray-600" };

  return (
    <div className={["bg-white border rounded-xl px-4 py-3 mb-2 transition-colors", finished ? "border-gray-100 opacity-70" : "border-gray-100 hover:border-gray-200"].join(" ")}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm truncate">{b.courseTitle || "คอร์ส"}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {b.startTime ? `${formatDate(b.startTime)} · ${formatTime(b.startTime)}–${formatTime(b.endTime)}` : "ยังไม่ระบุวันเวลา"}
          </p>
          <p className="text-xs font-semibold text-indigo-600 mt-0.5">฿{b.price?.toLocaleString() ?? "–"}</p>
          {!finished && b.classLink && (
            <a href={b.classLink} target="_blank" className="text-xs text-blue-600 underline mt-0.5 inline-block">เข้าเรียนออนไลน์</a>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.cls}`}>{st.text}</span>
          {!finished && b.status === "confirmed" && onCompleteClick && (
            <button
              onClick={() => onCompleteClick(b)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-purple-600 text-white hover:bg-purple-700 active:scale-95 transition-all"
            >
              จบคอร์ส
            </button>
          )}
        </div>
      </div>
      {finished && (
        <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
          <span>✓</span> คอร์สนี้เสร็จสิ้นแล้ว · ไม่สามารถดำเนินการใดได้
        </p>
      )}
    </div>
  );
}

function EmptyState({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="text-center py-10 border border-dashed border-gray-200 rounded-xl text-gray-400">
      <div className="text-2xl mb-1">{icon}</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-3 animate-pulse">
      <div className="h-6 bg-gray-100 rounded w-1/3" />
      <div className="h-64 bg-gray-100 rounded-xl" />
      <div className="h-14 bg-gray-100 rounded-xl" />
      <div className="h-14 bg-gray-100 rounded-xl" />
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
        const data: Booking[] = await r.json();
        const list = Array.isArray(data) ? data : [];

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
      bookingId: popupBooking._id,
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

      <div className="min-h-screen bg-gray-100 p-10">
        <h1 className="text-2xl font-bold mb-2">ตารางเรียนของฉัน</h1>
        <button onClick={() => router.push("/home/student")} className="text-sm mb-6 hover:underline">
          ← ย้อนกลับ
        </button>

        <div className="max-w-2xl mx-auto px-4 mb-5 -mt-4">
          <p className="text-sm text-gray-400 mb-5">ดูคอร์สที่จองไว้ทั้งหมด</p>

          <Calendar
            bookings={bookings}
            selectedDate={selectedDate}
            onSelect={(d) => setSelectedDate((prev) => (prev && isSameDay(prev, d) ? null : d))}
          />

          {selectedDate && (
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
              <span>วันที่ {formatDate(selectedDate.toISOString())}</span>
              <button onClick={() => setSelectedDate(null)} className="text-indigo-600 underline">ล้าง</button>
            </div>
          )}

          <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4">
            {(["upcoming", "completed"] as const).map((t) => {
              const count = filterByDate(t === "upcoming" ? upcoming : completed).length;
              const label = t === "upcoming" ? "กำลังมาถึง" : "เรียนจบแล้ว";
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={[
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium transition-colors",
                    tab === t ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700",
                  ].join(" ")}
                >
                  {label}
                  <span className={["text-xs px-1.5 py-0.5 rounded-full font-semibold", tab === t ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-500"].join(" ")}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {activeList.length === 0 ? (
            tab === "upcoming"
              ? <EmptyState icon="" text="ไม่มีคอร์สที่กำลังมาถึง" />
              : <EmptyState icon="" text="ยังไม่มีคอร์สที่เรียนจบ" />
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
    </>
  );
}