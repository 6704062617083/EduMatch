"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import SupportModal from "@/components/SupportModal";

export default function TutorHome() {
  const [showModal, setShowModal] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [link, setLink] = useState("");
  const [price, setPrice] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showTagList, setShowTagList] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<string>("");
  const [avgRating, setAvgRating] = useState<number | null>(null);
  const [totalReviews, setTotalReviews] = useState<number>(0);
  const [showSupport, setShowSupport] = useState(false);

  const subjectTags = [
    "คณิตศาสตร์", "ฟิสิกส์", "เคมี", "ชีววิทยา", "วิทยาศาสตร์ทั่วไป",
    "ภาษาอังกฤษ", "ภาษาไทย", "ภาษาจีน", "ภาษาญี่ปุ่น", "ภาษาเกาหลี",
    "สังคมศึกษา", "ประวัติศาสตร์", "ภูมิศาสตร์", "เศรษฐศาสตร์",
    "โปรแกรมมิ่ง", "วิทยาการคอมพิวเตอร์", "AI", "TGAT1", "TGAT2", "TGAT3",
  ];

  useEffect(() => {
    fetch("/api/me")
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        fetchCourses(data._id);
      })
      .catch(() => {
        window.location.href = "/login";
      });

    fetch("/api/tutor/verify/status")
      .then((res) => res.json())
      .then((doc) => {
        if (doc?.status) setVerifyStatus(doc.status);
      });

    fetch("/api/tutor/rating")
      .then((res) => res.json())
      .then((data) => {
        if (data?.avgRating !== undefined) setAvgRating(data.avgRating);
        if (data?.totalReviews !== undefined) setTotalReviews(data.totalReviews);
      });
  }, []);

  async function fetchCourses(tutorId: string) {
    try {
      const res = await fetch(`/api/courses?tutorId=${tutorId}`);
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error(error);
    }
  }

  function toggleTag(tag: string) {
    if (tags.includes(tag)) {
      setTags(tags.filter((t) => t !== tag));
    } else {
      setTags([...tags, tag]);
    }
  }

  async function handleCreate() {
    if (!user) return;
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/courses/${editingId}` : "/api/courses";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: courseName,
        description,
        startTime,
        endTime,
        classLink: link,
        price: Number(price),
        tags,
        tutorId: user._id,
      }),
    });
    if (!res.ok) {
      alert("Something went wrong");
      return;
    }
    setShowModal(false);
    setCourseName("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setLink("");
    setPrice("");
    setTags([]);
    setEditingId(null);
    fetchCourses(user._id);
  }

  async function handleDelete(id: string) {
    if (!user) return;
    const res = await fetch(`/api/courses/${id}?tutorId=${user._id}`, { method: "DELETE" });
    if (!res.ok) {
      alert("Delete failed");
      return;
    }
    setCourses((prev) => prev.filter((c) => c._id !== id));
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  return (
    <div className="min-h-screen bg-orange-50 font-sans tracking-tight antialiased flex flex-col">
      <div className="flex justify-between items-center px-10 py-5 bg-[#FC5404] text-white shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/home/tutor">
            <Image src="/Edu_icon.png" alt="Edumatch Logo" width={120} height={35} className="object-contain cursor-pointer" />
          </Link>
          <div className="h-6 w-[1px] bg-white/30 ml-2"></div>
          <span className="text-lg font-black tracking-tighter uppercase">คอร์สของฉัน</span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/home/tutor/request">
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/20">
              Booking Request
            </button>
          </Link>
          <Link href="/home/tutor/myschedule">
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/20">
              ตารางสอน
            </button>
          </Link>
          <Link href="/home/tutor/wallet">
            <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-bold transition-all border border-white/20">
              กระเป๋าเงิน
            </button>
          </Link>

          <div className="flex items-center gap-3 group cursor-pointer relative" onClick={() => setShowMenu(!showMenu)}>
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-bold leading-none">{user?.name} {user?.surname}</p>
              {avgRating !== null && (
                <p className="text-[11px] text-white/80 font-medium flex items-center gap-1 justify-end">
                  <span className="text-yellow-300">★</span>
                  {avgRating.toFixed(1)} ({totalReviews} รีวิว)
                </p>
              )}
            </div>
            <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center font-bold text-white transition-transform group-hover:scale-105 uppercase">
              {user?.name?.[0]}
            </div>

            {showMenu && (
              <div className="absolute top-14 right-0 bg-white border border-orange-100 rounded-2xl shadow-xl p-2 w-40 z-50">
                <Link href="/home/tutor/verify">
                  <button className="w-full text-left bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors mb-1">
                    Verify Account
                  </button>
                </Link>
                <Link href="/home/tutor/status">
                  <button className="w-full text-left bg-gray-50 hover:bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors mb-1">
                    Verify Status
                  </button>
                </Link>
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

      <div className="p-8 max-w-[1400px] mx-auto w-full">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black text-[#1e3a5f] flex items-center gap-3">
            คอร์สที่เปิดสอน
            <span className="bg-orange-500 text-white text-sm px-2.5 py-0.5 rounded-full">{courses.length}</span>
          </h2>
          <button
            onClick={() => {
              if (verifyStatus !== "approved") {
                alert("กรุณายืนยันตัวตนก่อนสร้าง Course");
                return;
              }
              setEditingId(null);
              setCourseName("");
              setDescription("");
              setStartTime("");
              setEndTime("");
              setLink("");
              setPrice("");
              setTags([]);
              setShowModal(true);
            }}
            className="px-6 py-2.5 rounded-2xl bg-[#FC5404] hover:bg-orange-600 text-white text-sm font-black shadow-lg shadow-orange-100 transition-all active:scale-95 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
            สร้างคอร์ส
          </button>
        </div>

        {courses.length === 0 && (
          <div className="bg-white rounded-[32px] p-16 text-center border-2 border-orange-100 border-dashed text-gray-300 font-bold">
            ยังไม่มีคอร์สเรียน กด &quot;สร้างคอร์ส&quot; เพื่อเริ่มต้น
          </div>
        )}

        <div className="space-y-4">
          {courses.map((course) => (
            <div
              key={course._id}
              className="bg-white border border-orange-100 rounded-[28px] p-6 shadow-sm hover:shadow-xl hover:ring-1 hover:ring-orange-200 transition-all duration-300"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-black text-[#1e3a5f] mb-1 leading-tight">{course.title}</h3>

                  {course.description && (
                    <p className="text-sm text-gray-500 font-medium mb-3 leading-relaxed">{course.description}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {course.tags?.map((tag: string) => (
                      <span key={tag} className="bg-orange-50 border border-orange-100 text-orange-600 px-3 py-1 rounded-xl text-[11px] font-extrabold uppercase tracking-wide">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-4 text-[12px] text-gray-400 font-medium">
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      เริ่ม: {course.startTime ? new Date(course.startTime).toLocaleString() : "-"}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      สิ้นสุด: {course.endTime ? new Date(course.endTime).toLocaleString() : "-"}
                    </span>
                    {course.classLink && (
                      <a
                        href={course.classLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-orange-500 hover:text-orange-600 font-bold transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        ลิงก์ห้องเรียน
                      </a>
                    )}
                  </div>
                </div>

                <div className="ml-6 text-right">
                  <p className="text-2xl font-black text-orange-500">฿{course.price?.toLocaleString()}</p>
                  <p className="text-[11px] text-gray-400 font-medium">ต่อคอร์ส</p>
                </div>
              </div>

              <div className="flex gap-2 mt-2 pt-4 border-t border-orange-50">
                <button
                  onClick={() => {
                    setEditingId(course._id);
                    setCourseName(course.title);
                    setDescription(course.description || "");
                    setStartTime(course.startTime?.slice(0, 16) || "");
                    setEndTime(course.endTime?.slice(0, 16) || "");
                    setLink(course.classLink || "");
                    setPrice(course.price?.toString() || "");
                    setTags(course.tags || []);
                    setShowModal(true);
                  }}
                  className="px-4 py-2.5 rounded-2xl border border-orange-100 bg-orange-50 text-[#1e3a5f] text-sm font-bold hover:bg-orange-100 transition-all active:scale-95"
                >
                  แก้ไข
                </button>
                <button
                  onClick={() => handleDelete(course._id)}
                  className="px-4 py-2.5 rounded-2xl border border-red-100 bg-red-50 text-red-500 text-sm font-bold hover:bg-red-100 transition-all active:scale-95"
                >
                  ลบ
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white rounded-[32px] p-8 w-[620px] max-w-[90%] shadow-2xl">
            <h3 className="text-xl font-black text-[#1e3a5f] mb-1">
              {editingId ? "แก้ไขคอร์ส" : "สร้างคอร์สใหม่"}
            </h3>
            <p className="text-sm text-gray-400 font-medium mb-6">กรอกข้อมูลคอร์สให้ครบถ้วน</p>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="ชื่อคอร์ส"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-orange-100 bg-orange-50 text-sm font-bold text-[#1e3a5f] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <input
                type="number"
                placeholder="ราคา (บาท)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-orange-100 bg-orange-50 text-sm font-bold text-[#1e3a5f] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <textarea
                placeholder="รายละเอียดคอร์ส"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-2 w-full px-4 py-3 rounded-2xl border border-orange-100 bg-orange-50 text-sm font-bold text-[#1e3a5f] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 h-[80px] resize-none"
              />

              <div className="relative">
                <div
                  onClick={() => setShowTagList(!showTagList)}
                  className="w-full px-4 py-3 rounded-2xl border border-orange-100 bg-orange-50 text-sm font-bold text-[#1e3a5f] cursor-pointer flex justify-between items-center"
                >
                  <span className={tags.length > 0 ? "text-[#1e3a5f]" : "text-gray-300"}>
                    {tags.length > 0 ? tags.join(", ") : "เลือกวิชา"}
                  </span>
                  <span className="text-gray-400 text-xs">▼</span>
                </div>
                {showTagList && (
                  <div className="absolute top-[52px] left-0 w-full border border-orange-100 rounded-2xl bg-white shadow-xl max-h-[200px] overflow-y-auto z-10">
                    {subjectTags.map((tag) => {
                      const selected = tags.includes(tag);
                      return (
                        <div
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`px-4 py-2.5 cursor-pointer flex justify-between items-center text-sm font-bold transition-colors ${selected ? "bg-orange-50 text-orange-600" : "text-[#1e3a5f] hover:bg-orange-50"}`}
                        >
                          <span>{tag}</span>
                          {selected && <span className="text-orange-500 text-xs">✓</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Google Meet / Zoom Link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-orange-100 bg-orange-50 text-sm font-bold text-[#1e3a5f] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter px-1">เวลาเริ่ม</p>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-orange-100 bg-orange-50 text-sm font-bold text-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter px-1">เวลาสิ้นสุด</p>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-orange-100 bg-orange-50 text-sm font-bold text-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-orange-300"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3.5 rounded-2xl border border-orange-100 bg-white text-[#1e3a5f] font-bold transition-all active:scale-95"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 py-3.5 rounded-2xl bg-[#FC5404] hover:bg-orange-600 text-white font-black shadow-lg shadow-orange-100 transition-all active:scale-95"
              >
                {editingId ? "บันทึกการแก้ไข" : "สร้างคอร์ส"}
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setShowSupport(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-[#FC5404] hover:bg-orange-600 text-white shadow-xl shadow-orange-200 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
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