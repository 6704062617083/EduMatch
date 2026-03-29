"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

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
  waiting_payment: { text: "รอชำระเงิน",  cls: "bg-blue-50 text-blue-600 border-blue-100" },
  confirmed:       { text: "ยืนยันแล้ว",  cls: "bg-green-50 text-green-600 border-green-100" },
  completed:       { text: "สอนจบแล้ว",   cls: "bg-orange-50 text-orange-500 border-orange-100" },
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

function BookingCard({ b }: { b: Booking }) {
  const st = statusLabel[b.status] ?? { text: b.status, cls: "bg-gray-50 text-gray-400 border-gray-100" };
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
    <div className={[
      "bg-white border rounded-[24px] px-5 py-4 mb-3 transition-all",
      finished ? "border-orange-50 opacity-60" : "border-orange-100 hover:shadow-md hover:ring-1 hover:ring-orange-200",
    ].join(" ")}>
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-black text-[#1e3a5f] text-[15px] truncate leading-tight">{b.courseTitle || "คอร์ส"}</p>
          <p className="text-[11px] font-bold text-gray-400 mt-1">นักเรียน: {b.studentName}</p>
          <p className="text-[11px] font-bold text-gray-400 mt-0.5 uppercase tracking-wide">
            {b.startTime
              ? `${formatDate(b.startTime)} · ${formatTime(b.startTime)}–${formatTime(b.endTime)}`
              : "ยังไม่ระบุวันเวลา"}
          </p>
          <p className="text-sm font-black text-orange-500 mt-1">฿{b.price?.toLocaleString() ?? "–"}</p>

          {b.classLink && b.status === "confirmed" && !finished && canJoin && (
            <a
              href={b.classLink}
              target="_blank"
              className="text-xs font-bold text-[#FC5404] underline mt-1 inline-block"
            >
              เข้าสอนออนไลน์ →
            </a>
          )}

          {b.classLink && b.status === "confirmed" && !finished && !canJoin && diffMs !== null && diffMs > 0 && (
            <span className="text-[11px] font-bold text-gray-400 mt-1 inline-block">
              เข้าสอนได้ในอีก{" "}
              {diffHour && diffHour > 0 && `${diffHour} ชม. `}
              {diffMin} นาที
            </span>
          )}
        </div>

        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-xl border uppercase tracking-wider ${st.cls}`}>
          {st.text}
        </span>
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
    <div className="min-h-screen bg-orange-50 font-sans tracking-tight antialiased flex flex-col">
      <div className="flex items-center px-10 py-5 bg-[#FC5404] text-white shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/home/tutor">
            <Image
              src="/Edu_icon.png"
              alt="Edumatch Logo"
              width={120}
              height={35}
              className="object-contain cursor-pointer"
            />
          </Link>
          <div className="h-6 w-[1px] bg-white/30"></div>
          <span className="text-lg font-black tracking-tighter uppercase text-white">ตารางสอนของฉัน</span>
        </div>
      </div>

      <div className="w-full pb-12">
        <div className="px-10 mt-8 mb-6">
          <button
            onClick={() => router.push("/home/tutor")}
            className="bg-white hover:bg-orange-50 text-[#FC5404] px-5 py-2.5 rounded-2xl text-sm font-bold transition-all border border-orange-100 shadow-sm active:scale-95 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            ย้อนกลับ
          </button>
        </div>

        <div className="max-w-2xl mx-auto px-6">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-6">ดูคอร์สที่รับสอนทั้งหมด</p>

          <Calendar
            bookings={bookings}
            selectedDate={selectedDate}
            onSelect={(d) =>
              setSelectedDate((prev) => (prev && isSameDay(prev, d) ? null : d))
            }
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
              const label = t === "upcoming" ? "กำลังมาถึง" : "สอนจบแล้ว";
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={[
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95",
                    tab === t ? "bg-[#FC5404] text-white shadow-md shadow-orange-100" : "text-gray-400 hover:text-[#1e3a5f]",
                  ].join(" ")}
                >
                  {label}
                  <span className={[
                    "text-[10px] px-1.5 py-0.5 rounded-lg font-black",
                    tab === t ? "bg-white/20 text-white" : "bg-orange-50 text-orange-400",
                  ].join(" ")}>
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
    </div>
  );
}