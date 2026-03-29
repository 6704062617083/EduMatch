"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import SupportModal from "@/components/SupportModal";

const SUBJECT_TAGS = [
  "คณิตศาสตร์", "ฟิสิกส์", "เคมี", "ชีววิทยา", "วิทยาศาสตร์ทั่วไป",
  "ภาษาอังกฤษ", "ภาษาไทย", "ภาษาจีน", "ภาษาญี่ปุ่น", "ภาษาเกาหลี",
  "สังคมศึกษา", "ประวัติศาสตร์", "ภูมิศาสตร์", "เศรษฐศาสตร์",
  "โปรแกรมมิ่ง", "วิทยาการคอมพิวเตอร์", "AI", "TGAT1", "TGAT2", "TGAT3",
];

export default function StudentHome() {
  const [courses, setCourses] = useState<any[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [tagFilter, setTagFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [bookingLoading, setBookingLoading] = useState<string | null>(null);
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);
  const [selectedBookingCourse, setSelectedBookingCourse] = useState<any>(null);
  const [showTutorProfile, setShowTutorProfile] = useState(false);
  const [tutorProfile, setTutorProfile] = useState<any>(null);
  const [tutorProfileLoading, setTutorProfileLoading] = useState(false);
  const [tutorRatings, setTutorRatings] = useState<Record<string, number>>({});
  const [showSupport, setShowSupport] = useState(false);

  const router = useRouter();

  useEffect(() => {
    fetch("/api/me")
      .then(res => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then(data => setUser(data))
      .catch(() => { window.location.href = "/login"; });

    fetchCourses();
  }, []);

  useEffect(() => {
    handleSearch(search);
  }, [search, courses, tagFilter, minPrice, maxPrice]);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/student-courses");
      const data = await res.json();
      const now = new Date();
      const activeCourses = data.filter((course: any) => {
        if (!course.endTime) return true;
        return new Date(course.endTime) > now;
      });
      setCourses(activeCourses);
      setFilteredCourses(activeCourses);

      const ratings: Record<string, number> = {};
      await Promise.all(
        activeCourses.map(async (course: any) => {
          const tutorId = course.tutor?._id;
          if (!tutorId || ratings[tutorId] !== undefined) return;
          const r = await fetch(`/api/tutor/rating/${tutorId}`);
          const d = await r.json();
          ratings[tutorId] = d.avgRating ?? 0;
        })
      );
      setTutorRatings(ratings);
    } catch (error) {
      console.error(error);
    }
  }

  function handleSearch(keyword: string) {
    const lower = keyword.toLowerCase();
    const now = new Date();
    const filtered = courses.filter((course: any) => {
      if (course.endTime && new Date(course.endTime) <= now) return false;
      const title = course.title?.toLowerCase() || "";
      const tutor = (course.tutor?.name + " " + course.tutor?.surname)?.toLowerCase() || "";
      const tags = course.tags?.join(" ").toLowerCase() || "";
      const matchSearch = title.includes(lower) || tutor.includes(lower) || tags.includes(lower);
      const matchTag = tagFilter ? course.tags?.includes(tagFilter) : true;
      const matchMinPrice = minPrice ? course.price >= Number(minPrice) : true;
      const matchMaxPrice = maxPrice ? course.price <= Number(maxPrice) : true;
      return matchSearch && matchTag && matchMinPrice && matchMaxPrice;
    });
    setFilteredCourses(filtered);
  }

  function openDetail(course: any) {
    setSelectedCourse(course);
    setShowDetail(true);
  }

  function openBookingConfirm(course: any) {
    setSelectedBookingCourse(course);
    setShowBookingConfirm(true);
  }

  async function openTutorProfile(tutorId: string) {
    setTutorProfileLoading(true);
    setShowTutorProfile(true);
    const res = await fetch(`/api/tutor/profile/${tutorId}`);
    const data = await res.json();
    if (res.ok) {
      setTutorProfile(data);
    } else {
      setTutorProfile(null);
    }
    setTutorProfileLoading(false);
  }

  async function handleBooking(courseId: string) {
    if (!user) {
      alert("กรุณา login");
      return;
    }
    setBookingLoading(courseId);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: user._id,
          courseId: courseId,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "จองไม่สำเร็จ");
        setBookingLoading(null);
        return;
      }
      alert("ส่งคำขอจองไปยังติวเตอร์แล้ว");
      setShowBookingConfirm(false);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาด");
    }
    setBookingLoading(null);
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/";
  }

return (
    <div className="min-h-screen bg-orange-50 font-sans tracking-tight antialiased flex flex-col">
      <div className="flex justify-between items-center px-4 md:px-10 py-4 md:py-5 bg-[#FC5404] text-white shadow-md">
        <div className="flex items-center gap-2 md:gap-4">
          <Link href="/home/student">
            <Image src="/Edu_icon.png" alt="Edumatch Logo" width={100} height={30} className="object-contain cursor-pointer md:w-[120px] md:h-[35px]" />
          </Link>
          <div className="hidden md:block h-6 w-[1px] bg-white/30 ml-2"></div>
          <span className="hidden md:inline text-lg font-black tracking-tighter uppercase">คอร์สเรียนทั้งหมด</span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => router.push("/home/student/mybooking")}
            className="bg-white/10 hover:bg-white/20 text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all border border-white/20"
          >
            การจอง<span className="hidden md:inline">ของฉัน</span>
          </button>
          <button
            onClick={() => router.push("/home/student/myschedule")}
            className="bg-white/10 hover:bg-white/20 text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all border border-white/20"
          >
            ตาราง<span className="hidden md:inline">เรียน</span>
          </button>

          <div className="flex items-center gap-3 group cursor-pointer relative" onClick={() => setShowMenu(!showMenu)}>
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-bold leading-none">{user?.name} {user?.surname}</p>
              <p className="text-[11px] text-white/70 font-medium">นักเรียน</p>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center font-bold text-white transition-transform group-hover:scale-105 uppercase">
              {user?.name?.[0]}
            </div>

            {showMenu && (
              <div className="absolute top-14 right-0 bg-white border border-orange-100 rounded-2xl shadow-xl p-2 w-40 z-50">
                <button
                  onClick={handleLogout}
                  className="w-full text-left bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full">
        <div className="flex gap-2 md:gap-3 mb-6 md:mb-8">
          <div className="flex-1 relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              type="text"
              placeholder="ค้นหาคอร์ส / ชื่อติวเตอร์ / วิชา"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-orange-100 bg-white shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilter(true)}
            className="px-4 md:px-5 py-3 rounded-2xl border border-orange-100 bg-white shadow-sm text-sm font-bold text-[#1e3a5f] hover:bg-orange-50 transition-all flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 4h18M7 8h10M11 12h2" />
            </svg>
            <span className="hidden sm:inline">กรอง</span>
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl md:text-2xl font-black text-[#1e3a5f] flex items-center gap-3">
            คอร์สที่เปิดสอน
            <span className="bg-orange-500 text-white text-sm px-2.5 py-0.5 rounded-full">{filteredCourses.length}</span>
          </h2>
        </div>

        {filteredCourses.length === 0 && (
          <div className="bg-white rounded-[32px] p-10 md:p-16 text-center border-2 border-orange-100 border-dashed text-gray-300 font-bold">ไม่พบคอร์สที่ตรงกับการค้นหา</div>
        )}

        <div className="space-y-4">
          {filteredCourses.map((course: any) => (
            <div
              key={course._id}
              className="bg-white border border-orange-100 rounded-[28px] p-5 md:p-6 shadow-sm hover:shadow-xl hover:ring-1 hover:ring-orange-200 transition-all duration-300"
            >
              <div className="flex flex-col md:flex-row justify-between items-start">
                <div className="flex-1 w-full">
                  <h3 className="text-lg md:text-xl font-black text-[#1e3a5f] mb-1 leading-tight">{course.title}</h3>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 font-black text-xs uppercase">
                      {course.tutor?.name?.[0]}
                    </div>
                    <span className="text-sm text-gray-500 font-medium">
                      {course.tutor?.name} {course.tutor?.surname}
                    </span>
                    <span className="text-yellow-500 font-black text-sm flex items-center gap-0.5">
                      ★ {tutorRatings[course.tutor?._id] !== undefined
                        ? tutorRatings[course.tutor?._id] > 0
                          ? tutorRatings[course.tutor?._id].toFixed(1)
                          : "0"
                        : "0"}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {course.tags?.map((tag: string) => (
                      <span key={tag} className="bg-orange-50 border border-orange-100 text-orange-600 px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-3 md:mt-0 ml-0 md:ml-6 text-left md:text-right">
                  <p className="text-2xl font-black text-orange-500">฿{course.price?.toLocaleString()}</p>
                  <p className="text-[11px] text-gray-400 font-medium hidden md:block">ต่อคอร์ส</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-2 pt-4 border-t border-orange-50">
                <button
                  onClick={() => openDetail(course)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-orange-100 bg-orange-50 text-[#1e3a5f] text-sm font-bold hover:bg-orange-100 transition-all active:scale-95 text-center"
                >
                  รายละเอียด
                </button>
                <button
                  onClick={() => openTutorProfile(course.tutor?._id)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-2xl border border-orange-100 bg-white text-[#1e3a5f] text-sm font-bold hover:bg-orange-50 transition-all active:scale-95 text-center"
                >
                  โปรไฟล์ติวเตอร์
                </button>
                <button
                  onClick={() => openBookingConfirm(course)}
                  className="w-full sm:w-auto sm:ml-auto px-6 py-2.5 rounded-2xl bg-[#FC5404] hover:bg-orange-600 text-white text-sm font-black shadow-lg shadow-orange-100 transition-all active:scale-95 text-center"
                >
                  จองเรียน
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showBookingConfirm && selectedBookingCourse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-6 md:p-8 w-[480px] max-w-full shadow-2xl">
            <h3 className="text-xl font-black text-[#1e3a5f] mb-1">ยืนยันการจอง</h3>
            <p className="text-sm text-gray-400 font-medium mb-6">กรุณาตรวจสอบข้อมูลก่อนยืนยัน</p>
            <div className="bg-orange-50 rounded-2xl p-4 md:p-5 space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-[11px] md:text-[12px] font-black text-gray-400 uppercase tracking-wider shrink-0">คอร์ส</span>
                <span className="text-xs md:text-sm font-bold text-[#1e3a5f] text-right ml-4">{selectedBookingCourse.title}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[11px] md:text-[12px] font-black text-gray-400 uppercase tracking-wider shrink-0">เวลา</span>
                <span className="text-xs md:text-sm font-bold text-[#1e3a5f] text-right ml-4">
                  {new Date(selectedBookingCourse.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(selectedBookingCourse.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-orange-100">
                <span className="text-[11px] md:text-[12px] font-black text-gray-400 uppercase tracking-wider shrink-0">ราคา</span>
                <span className="text-lg md:text-xl font-black text-orange-500">฿{selectedBookingCourse.price?.toLocaleString()}</span>
              </div>
            </div>
            <div className="flex gap-2 md:gap-3">
              <button onClick={() => setShowBookingConfirm(false)} className="flex-1 py-3 md:py-3.5 rounded-2xl border border-orange-100 bg-white text-[#1e3a5f] text-sm md:text-base font-bold transition-all active:scale-95">
                ยกเลิก
              </button>
              <button onClick={() => handleBooking(selectedBookingCourse._id)} className="flex-1 py-3 md:py-3.5 rounded-2xl bg-[#FC5404] hover:bg-orange-600 text-white text-sm md:text-base font-black shadow-lg shadow-orange-100 transition-all active:scale-95">
                ยืนยันจอง
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedCourse && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-6 md:p-8 w-[500px] max-w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-black text-[#1e3a5f] mb-6">รายละเอียดคอร์ส</h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">ชื่อคอร์ส</p>
                <p className="text-[14px] text-[#1e3a5f] font-bold">{selectedCourse.title}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">ติวเตอร์</p>
                <p className="text-[14px] text-[#1e3a5f] font-bold">{selectedCourse.tutor?.name} {selectedCourse.tutor?.surname}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">ราคา</p>
                <p className="text-[14px] text-orange-500 font-black">฿{selectedCourse.price?.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">เวลาเรียน</p>
                <p className="text-[14px] text-[#1e3a5f] font-bold">{new Date(selectedCourse.startTime).toLocaleString()} - {new Date(selectedCourse.endTime).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">รายละเอียดคอร์ส</p>
                <p className="text-[14px] text-[#1e3a5f] font-bold leading-relaxed">{selectedCourse.description}</p>
              </div>
            </div>
            <button onClick={() => setShowDetail(false)} className="mt-8 w-full py-3 md:py-3.5 rounded-2xl bg-[#FC5404] hover:bg-orange-600 text-white font-black shadow-lg shadow-orange-100 transition-all active:scale-95">
              ปิด
            </button>
          </div>
        </div>
      )}

      {showTutorProfile && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-6 md:p-8 w-[500px] max-w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-xl font-black text-[#1e3a5f] mb-6">โปรไฟล์ติวเตอร์</h3>
            {tutorProfileLoading ? (
              <div className="flex flex-col items-center py-10 text-orange-300">
                <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-3"></div>
                <p className="font-bold animate-pulse text-sm">กำลังโหลด...</p>
              </div>
            ) : !tutorProfile ? (
              <p className="text-gray-400 font-bold text-center py-10">ไม่พบข้อมูล</p>
            ) : (
              <div className="space-y-3">
                {[
                  { label: "ชื่อ-นามสกุล", value: `${tutorProfile.userId?.name} ${tutorProfile.userId?.surname}` },
                  { label: "อีเมล", value: tutorProfile.userId?.email },
                  { label: "เบอร์โทรศัพท์", value: tutorProfile.userId?.phone },
                  { label: "ระดับการศึกษา", value: tutorProfile.educationLevel },
                  { label: "สถาบัน", value: tutorProfile.university },
                  { label: "คณะ / สาขา", value: `${tutorProfile.faculty || "-"} / ${tutorProfile.major || "-"}` },
                  { label: "GPA", value: tutorProfile.gpa },
                  { label: "ประสบการณ์สอน", value: tutorProfile.tutorExp ? `${tutorProfile.tutorExp} ปี` : "-" },
                ].map((f) => (
                  <div key={f.label} className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">{f.label}</span>
                    <span className="text-[14px] text-[#1e3a5f] font-bold leading-tight">{f.value || "-"}</span>
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => { setShowTutorProfile(false); setTutorProfile(null); }}
              className="mt-8 w-full py-3 md:py-3.5 rounded-2xl bg-[#FC5404] hover:bg-orange-600 text-white font-black shadow-lg shadow-orange-100 transition-all active:scale-95"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {showFilter && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-[32px] p-6 md:p-8 w-[560px] max-w-full shadow-2xl">
            <h3 className="text-xl font-black text-[#1e3a5f] mb-6">กรองคอร์ส</h3>
            <div className="space-y-5">
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-2">วิชา</p>
                <select
                  value={tagFilter}
                  onChange={(e) => setTagFilter(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-orange-100 bg-orange-50 text-sm font-bold text-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-orange-300"
                >
                  <option value="">ทุกวิชา</option>
                  {SUBJECT_TAGS.map((tag) => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-2">ช่วงราคา (บาท)</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input type="number" placeholder="ราคาต่ำสุด" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="flex-1 px-4 py-3 rounded-2xl border border-orange-100 bg-orange-50 text-sm font-bold text-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-orange-300" />
                  <input type="number" placeholder="ราคาสูงสุด" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="flex-1 px-4 py-3 rounded-2xl border border-orange-100 bg-orange-50 text-sm font-bold text-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
              </div>
            </div>
            <div className="flex gap-2 md:gap-3 mt-8">
              <button onClick={() => setShowFilter(false)} className="flex-1 py-3 md:py-3.5 rounded-2xl border border-orange-100 bg-white text-[#1e3a5f] text-sm md:text-base font-bold transition-all active:scale-95">
                ยกเลิก
              </button>
              <button onClick={() => setShowFilter(false)} className="flex-1 py-3 md:py-3.5 rounded-2xl bg-[#FC5404] hover:bg-orange-600 text-white text-sm md:text-base font-black shadow-lg shadow-orange-100 transition-all active:scale-95">
                ค้นหา
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowSupport(true)}
        className="fixed bottom-6 right-6 z-50 w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#FC5404] hover:bg-orange-600 text-white shadow-xl shadow-orange-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
        title="ติดต่อ Support"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6 md:w-7 md:h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
        </svg>
      </button>

      <SupportModal open={showSupport} onClose={() => setShowSupport(false)} />
    </div>
  );
}