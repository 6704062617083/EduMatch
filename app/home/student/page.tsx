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
      setCourses(data);
      setFilteredCourses(data);

      const ratings: Record<string, number> = {};
      await Promise.all(
        data.map(async (course: any) => {
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
    const filtered = courses.filter((course: any) => {
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
    <div className="h-screen flex flex-col">
      <div className="px-10 py-5 text-2xl font-bold border-b border-gray-200 flex justify-between items-center">
        <Link href="/home/student">
          <Image
            src="/Edu_icon.png"
            alt="Edumatch Logo"
            width={140}
            height={40}
            className="cursor-pointer object-contain"
          />
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-base font-normal">
            {user?.name} {user?.surname}
          </span>

          <div className="relative flex flex-col items-center">
            <div
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-full border-2 border-black cursor-pointer"
            />
            <div className="text-xs mt-1">{user?.role}</div>

            {showMenu && (
              <div className="absolute top-14 right-0 bg-white border border-gray-300 rounded-lg p-2 shadow-md">
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white border-none px-3 py-1.5 rounded-md cursor-pointer text-xs"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-10">
        <div className="flex gap-2 mb-5">
          <input
            type="text"
            placeholder="ค้นหาคอร์ส / ชื่อติวเตอร์ / วิชา"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-3 py-2.5 rounded-md border border-gray-300"
          />
          <button
            onClick={() => setShowFilter(true)}
            className="px-4 py-2.5 rounded-md border border-gray-300 cursor-pointer bg-white"
          >
            Filter
          </button>
          <button
            onClick={() => router.push("/home/student/mybooking")}
            className="px-4 py-2.5 rounded-md border border-gray-300 cursor-pointer bg-white"
          >
            My Booking
          </button>
          <button
            onClick={() => router.push("/home/student/myschedule")}
            className="px-4 py-2.5 rounded-md border border-gray-300 cursor-pointer bg-white"
          >
            My Schedule
          </button>
        </div>

        <h2 className="mb-5 text-xl font-semibold">Available Courses</h2>

        {filteredCourses.length === 0 && <p>No courses available</p>}

        {filteredCourses.map((course: any) => (
          <div
            key={course._id}
            className="bg-white p-6 rounded-xl border border-gray-200 mb-4 shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <h3 className="text-2xl font-bold mb-2">{course.title}</h3>
            <p>
              Tutor: {course.tutor?.name} {course.tutor?.surname}
              {" "}
              <span className="text-yellow-500 font-bold">
                คะแนน(★ {tutorRatings[course.tutor?._id] !== undefined
                  ? tutorRatings[course.tutor?._id] > 0
                    ? tutorRatings[course.tutor?._id].toFixed(1)
                    : "0"
                  : "0"})
              </span>
            </p>
            <p className="font-bold">ราคา: {course.price?.toLocaleString()} บาท</p>

            <div className="mb-2 mt-2">
              {course.tags?.map((tag: string) => (
                <span key={tag} className="bg-blue-50 px-3 py-1 rounded-full text-xs mr-1">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex gap-2 mt-4">
              <button className="px-4 py-2 bg-gray-600 text-white border-none rounded-md cursor-pointer" onClick={() => openDetail(course)}>รายละเอียด</button>
              <button className="px-4 py-2 bg-green-600 text-white border-none rounded-md cursor-pointer" onClick={() => openTutorProfile(course.tutor?._id)}>ติวเตอร์โปรไฟล์</button>
              <button className="px-5 py-2 bg-indigo-700 text-white border-none rounded-md cursor-pointer" onClick={() => openBookingConfirm(course)}>จองเรียน</button>
            </div>
          </div>
        ))}
      </div>

      {showBookingConfirm && selectedBookingCourse && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[500px] max-w-[90%]">
            <p className="font-bold">ยืนยันการจอง</p>
            <p className="mt-2">{selectedBookingCourse.title}</p>
            <p>{new Date(selectedBookingCourse.startTime).toLocaleString()} - {new Date(selectedBookingCourse.endTime).toLocaleString()}</p>
            <p className="mt-2">ราคา {selectedBookingCourse.price?.toLocaleString()} บาท</p>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setShowBookingConfirm(false)} className="px-3 py-2 rounded-md border border-gray-300 bg-white">ยกเลิก</button>
              <button onClick={() => handleBooking(selectedBookingCourse._id)} className="px-3 py-2 rounded-md border-none bg-indigo-700 text-white">ยืนยันจอง</button>
            </div>
          </div>
        </div>
      )}

      {showDetail && selectedCourse && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[500px] max-w-[90%]">
            <p className="font-bold">ชื่อคอร์ส</p>
            <p>{selectedCourse.title}</p>
            <p className="font-bold mt-2">ติวเตอร์</p>
            <p>{selectedCourse.tutor?.name} {selectedCourse.tutor?.surname}</p>
            <p className="font-bold mt-2">ราคา</p>
            <p>{selectedCourse.price?.toLocaleString()} บาท</p>
            <p className="font-bold mt-2">เวลาเรียน</p>
            <p>{new Date(selectedCourse.startTime).toLocaleString()} - {new Date(selectedCourse.endTime).toLocaleString()}</p>
            <p className="font-bold mt-2">รายละเอียดคอร์ส</p>
            <p className="leading-relaxed">{selectedCourse.description}</p>
            <button onClick={() => setShowDetail(false)} className="mt-5 px-4 py-2 bg-orange-500 text-white border-none rounded-md">ปิด</button>
          </div>
        </div>
      )}

      {showTutorProfile && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[500px] max-w-[90%]">
            <p className="font-bold text-lg mb-4">โปรไฟล์ติวเตอร์</p>
            {tutorProfileLoading ? (
              <p>กำลังโหลด...</p>
            ) : !tutorProfile ? (
              <p>ไม่พบข้อมูล</p>
            ) : (
              <>
                <p className="font-bold">ชื่อ-นามสกุล</p>
                <p>{tutorProfile.userId?.name} {tutorProfile.userId?.surname}</p>
                <p className="font-bold mt-2">อีเมล</p>
                <p>{tutorProfile.userId?.email}</p>
                <p className="font-bold mt-2">เบอร์โทรศัพท์</p>
                <p>{tutorProfile.userId?.phone}</p>
                <p className="font-bold mt-2">ระดับการศึกษา</p>
                <p>{tutorProfile.educationLevel || "-"}</p>
                <p className="font-bold mt-2">สถาบัน</p>
                <p>{tutorProfile.university || "-"}</p>
                <p className="font-bold mt-2">คณะ / สาขา</p>
                <p>{tutorProfile.faculty || "-"} / {tutorProfile.major || "-"}</p>
                <p className="font-bold mt-2">GPA</p>
                <p>{tutorProfile.gpa || "-"}</p>
                <p className="font-bold mt-2">ประสบการณ์สอน</p>
                <p>{tutorProfile.tutorExp ? `${tutorProfile.tutorExp} ปี` : "-"}</p>
              </>
            )}
            <button
              onClick={() => { setShowTutorProfile(false); setTutorProfile(null); }}
              className="mt-5 px-4 py-2 bg-orange-500 text-white border-none rounded-md"
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {showFilter && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-6 rounded-xl w-[500px] max-w-[90%]">
            <h3 className="mb-4 text-lg font-semibold">Filter</h3>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="w-full p-2 mb-4 rounded-md border border-gray-300"
            >
              <option value="">ทุกวิชา</option>
              {SUBJECT_TAGS.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
            <div className="flex gap-2 mb-5">
              <input type="number" placeholder="Min price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="flex-1 p-2 rounded-md border border-gray-300" />
              <input type="number" placeholder="Max price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="flex-1 p-2 rounded-md border border-gray-300" />
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowFilter(false)} className="px-3 py-2 rounded-md border border-gray-300 bg-white">Cancel</button>
              <button onClick={() => setShowFilter(false)} className="px-3 py-2 rounded-md border-none bg-orange-500 text-white">Apply</button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowSupport(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-indigo-700 text-white shadow-xl flex items-center justify-center hover:bg-indigo-800 transition-all hover:scale-105"
        title="ติดต่อ Support"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-7 h-7">
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
        </svg>
      </button>

      <SupportModal open={showSupport} onClose={() => setShowSupport(false)} />
    </div>
  );
}