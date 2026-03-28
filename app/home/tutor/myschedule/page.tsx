"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";

interface Booking {
  bookingId: string;
  studentName: string;
  courseTitle: string;
  subject: string;
  startTime: string | null;
  endTime: string | null;
  price: number;
  status: "waiting_payment" | "confirmed" | "completed";
  createdAt: string;
  classLink?: string;
}

const MONTH_TH = [
  "มกราคม","กุมภาพันธ์","มีนาคม","เมษายน","พฤษภาคม","มิถุนายน",
  "กรกฎาคม","สิงหาคม","กันยายน","ตุลาคม","พฤศจิกายน","ธันวาคม",
];
const DAY_TH = ["อา","จ","อ","พ","พฤ","ศ","ส"];

const statusLabel: Record<string, { text: string; cls: string }> = {
  waiting_payment: { text: "รอชำระเงิน", cls: "bg-blue-100 text-blue-700" },
  confirmed:       { text: "ยืนยันแล้ว", cls: "bg-green-100 text-green-700" },
  completed:       { text: "สอนจบแล้ว", cls: "bg-purple-100 text-purple-700" },
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
  if (b.status === "completed") return true;
  if (b.endTime && new Date(b.endTime) < new Date()) return true;
  return false;
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
    bookings.filter((b) => b.startTime).map((b) => new Date(b.startTime!)),
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
        <button onClick={prevMonth} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">‹</button>
        <span className="text-sm font-semibold text-gray-800">
          {MONTH_TH[viewMonth]} {viewYear + 543}
        </span>
        <button onClick={nextMonth} className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">›</button>
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
                "relative flex flex-col items-center py-1.5 rounded-lg text-sm",
                isSelected
                  ? "bg-indigo-600 text-white font-semibold"
                  : isToday
                  ? "text-indigo-600 font-bold hover:bg-gray-50"
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

function BookingCard({ b }: { b: Booking }) {
  const st = statusLabel[b.status] ?? { text: b.status, cls: "bg-gray-100 text-gray-600" };
  const now = new Date();
  const canJoin = 
    b.startTime &&
    new Date(b.startTime).getTime() - 10 * 60 * 1000 <= now.getTime();
  const start = b.startTime ? new Date(b.startTime) : null;
  const diffMs = start ? start.getTime() - now.getTime() : null;
  const diffHour = diffMs ? Math.floor(diffMs / (1000 * 60 * 60)) : null;
  const diffMin = diffMs ? Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)) : null;
  const finished = isFinished(b);

  return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 flex justify-between items-start mb-2 hover:border-gray-200">
      <div className="flex-1 min-w-0 pr-3">
        <p className="font-semibold text-gray-900 text-sm truncate">{b.courseTitle || "คอร์ส"}</p>
        <p className="text-xs text-gray-400 mt-0.5">นักเรียน: {b.studentName}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {b.startTime
            ? `${formatDate(b.startTime)} · ${formatTime(b.startTime)}–${formatTime(b.endTime)}`
            : "ยังไม่ระบุวันเวลา"}
        </p>
        <p className="text-xs font-semibold text-indigo-600 mt-0.5">
          ฿{b.price?.toLocaleString() ?? "–"}
        </p>

        {b.classLink && b.status === "confirmed" && !finished && canJoin && (
          <a
            href={b.classLink}
            target="_blank"
            className="text-xs text-blue-600 underline mt-1 inline-block"
          >
            เข้าสอนออนไลน์
          </a>
        )}

        {b.classLink && b.status === "confirmed" && !finished && !canJoin && diffMs !== null && diffMs > 0 && (
          <span className="text-xs text-gray-400 mt-1 inline-block">
            เข้าสอนได้ในอีก{" "}
            {diffHour && diffHour > 0 && `${diffHour} ชม. `}
            {diffMin} นาที
          </span>
        )}
      </div>

      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${st.cls}`}>
        {st.text}
      </span>
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

export default function TutorMySchedule() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tab, setTab] = useState<"upcoming" | "completed">("upcoming");

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await fetch("/api/me");
        if (!res.ok) { router.push("/login"); return; }
        const user = await res.json();

        const r = await fetch(`/api/tutor/myschedule?tutorId=${user._id}`);
        const data = await r.json();
        setBookings(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [router]);

  const upcoming = useMemo(() => bookings.filter((b) => !isFinished(b)), [bookings]);
  const completed = useMemo(() => bookings.filter((b) => isFinished(b)), [bookings]);

  const filterByDate = (list: Booking[]) => {
    if (!selectedDate) return list;
    return list.filter(
      (b) => b.startTime && isSameDay(new Date(b.startTime), selectedDate)
    );
  };

  const activeList = filterByDate(tab === "upcoming" ? upcoming : completed);

  if (loading) return <Skeleton />;

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-2xl font-bold mb-2">ตารางสอนของฉัน</h1>
      <button onClick={() => router.push("/home/tutor")} className="text-sm mb-6 hover:underline">
        ← ย้อนกลับ
      </button>

      <div className="max-w-2xl mx-auto px-4 mb-5 -mt-4">
        <p className="text-sm text-gray-400 mb-5">ดูคอร์สที่รับสอนทั้งหมด</p>

        <Calendar
          bookings={bookings}
          selectedDate={selectedDate}
          onSelect={(d) =>
            setSelectedDate((prev) => (prev && isSameDay(prev, d) ? null : d))
          }
        />

        {selectedDate && (
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
            <span>วันที่ {formatDate(selectedDate.toISOString())}</span>
            <button onClick={() => setSelectedDate(null)} className="text-indigo-600 underline">
              ล้าง
            </button>
          </div>
        )}

        <div className="flex gap-1 p-1 bg-gray-100 rounded-lg mb-4">
          {(["upcoming", "completed"] as const).map((t) => {
            const count = filterByDate(t === "upcoming" ? upcoming : completed).length;
            const label = t === "upcoming" ? "กำลังมาถึง" : "สอนจบแล้ว";
            return (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={[
                  "flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm font-medium",
                  tab === t
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700",
                ].join(" ")}
              >
                {label}
                <span
                  className={[
                    "text-xs px-1.5 py-0.5 rounded-full font-semibold",
                    tab === t ? "bg-indigo-100 text-indigo-600" : "bg-gray-200 text-gray-500",
                  ].join(" ")}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {activeList.length === 0 ? (
          tab === "upcoming"
            ? <EmptyState icon="" text="ไม่มีคอร์สที่กำลังมาถึง" />
            : <EmptyState icon="" text="ไม่มีคอร์สที่สอนจบแล้ว" />
        ) : (
          activeList.map((b) => <BookingCard key={b.bookingId} b={b} />)
        )}
      </div>
    </div>
  );
}