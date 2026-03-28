"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

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

  const subjectTags = [
    "คณิตศาสตร์",
    "ฟิสิกส์",
    "เคมี",
    "ชีววิทยา",
    "วิทยาศาสตร์ทั่วไป",
    "ภาษาอังกฤษ",
    "ภาษาไทย",
    "ภาษาจีน",
    "ภาษาญี่ปุ่น",
    "ภาษาเกาหลี",
    "สังคมศึกษา",
    "ประวัติศาสตร์",
    "ภูมิศาสตร์",
    "เศรษฐศาสตร์",
    "โปรแกรมมิ่ง",
    "วิทยาการคอมพิวเตอร์",
    "AI",
    "TGAT1",
    "TGAT2",
    "TGAT3",
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

    const res = await fetch(`/api/courses/${id}?tutorId=${user._id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      alert("Delete failed");
      return;
    }

    setCourses((prev) => prev.filter((c) => c._id !== id));
  }

  async function handleLogout() {
    await fetch("/api/logout", {
      method: "POST",
    });

    localStorage.removeItem("user");

    window.location.href = "/";
  }

  function renderStars(rating: number) {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < Math.round(rating) ? "text-[#f5a623] text-sm" : "text-gray-300 text-sm"}>
        ★
      </span>
    ));
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "20px 40px",
          fontSize: "22px",
          fontWeight: "bold",
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Link href="/home/tutor">
          <Image
            src="/Edu_icon.png"
            alt="Edumatch Logo"
            width={140}
            height={40}
            style={{ cursor: "pointer", objectFit: "contain" }}
          />
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-base font-normal">
              {user?.name} {user?.surname}
            </span>
            {avgRating !== null && (
              <div className="flex items-center gap-1 mt-[2px]">
                {renderStars(avgRating)}
                <span className="text-xs text-gray-600">
                  {avgRating.toFixed(1)} ({totalReviews} รีวิว)
                </span>
              </div>
            )}
          </div>

          <div className="relative flex flex-col items-center">
            <div
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-full border-2 border-black cursor-pointer"
            ></div>

            <div className="text-xs mt-1">
              {user?.role}
            </div>

            {showMenu && (
              <div className="absolute top-[60px] right-0 bg-white border border-gray-300 rounded-lg p-2.5 shadow-md">
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-2.5 py-1.5 rounded-md text-xs cursor-pointer"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        <div className="flex-1 p-10">
          <h2>My Courses</h2>

          {courses.length === 0 && <p>No courses yet</p>}

          {courses.map((course) => (
            <div
              key={course._id}
              style={{
                border: "1px solid #ccc",
                padding: "20px",
                borderRadius: "10px",
                marginBottom: "15px",
                backgroundColor: "white",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            >
              <h3 className="text-2xl font-bold mb-[6px] text-gray-900">
                {course.title}
              </h3>

              {course.description && <p>{course.description}</p>}

              <p>
                Start:{" "}
                {course.startTime
                  ? new Date(course.startTime).toLocaleString()
                  : "-"}
              </p>

              <p>
                End:{" "}
                {course.endTime
                  ? new Date(course.endTime).toLocaleString()
                  : "-"}
              </p>

              <p className="font-bold">
                ราคา: {course.price?.toLocaleString()} บาท
              </p>

              <div className="mb-2.5">
                {course.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    className="bg-blue-100 px-2.5 py-1 rounded-full text-xs mr-[5px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {course.classLink && (
                <p>
                  Class Link:{" "}
                  <a href={course.classLink} target="_blank" rel="noopener noreferrer">
                    {course.classLink}
                  </a>
                </p>
              )}

              <div className="mt-2.5">
                <button
                  className="px-4 py-1.5 bg-blue-500 text-white rounded-md mr-2.5 cursor-pointer"
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
                >
                  Edit
                </button>

                <button
                  className="px-4 py-1.5 bg-red-500 text-white rounded-md cursor-pointer"
                  onClick={() => handleDelete(course._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="w-[250px] pt-10 pr-[60px] pb-10 flex flex-col items-end">
          <button
            onClick={() => {
              if (verifyStatus !== "approved") {
                alert("กรุณายืนยันตัวตนก่อนสร้าง Course");
                return;
              }
              setEditingId(null);
              setShowModal(true);
            }}
            className="px-5 py-2 bg-blue-500 text-white rounded-md cursor-pointer mt-[30px]"
          >
            + Create course
          </button>

          <Link href="/home/tutor/verify">
            <button className="px-5 py-2 bg-gray-600 text-white rounded-md cursor-pointer mt-2.5">
              Verify account
            </button>
          </Link>

          <Link href="/home/tutor/request">
            <button className="px-5 py-2 bg-[#2a0edd] text-white rounded-md cursor-pointer mt-2.5">
              Booking request
            </button>
          </Link>

          <Link href="/home/tutor/status">
            <button className="px-5 py-2 bg-[#6e5be7] text-white rounded-md cursor-pointer mt-2.5">
              verify status
            </button>
          </Link>

          <Link href="/home/tutor/wallet">
            <button className="px-5 py-2 bg-[#e28223] text-white rounded-md cursor-pointer mt-2.5">
              My Wallet
            </button>
          </Link>

          <Link href="/home/tutor/myschedule">
            <button className="px-5 py-2 bg-[#ffd7b0] text-black rounded-md cursor-pointer mt-2.5">
              My Schedule
            </button>
          </Link>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-10 rounded-xl w-[700px]">
            <h2 className="mb-5">
              {editingId ? "Edit Course" : "Create Course"}
            </h2>

            <div className="grid grid-cols-2 gap-[15px]">
              <input
                type="text"
                placeholder="Course Name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                className="w-full p-2.5 rounded-md border border-gray-300"
              />

              <input
                type="number"
                placeholder="ราคา"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full p-2.5 rounded-md border border-gray-300"
                required
              />

              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2.5 rounded-md border border-gray-300 col-span-2 h-[80px]"
              />

              <div className="relative">
                <div
                  onClick={() => setShowTagList(!showTagList)}
                  className="w-full p-2.5 rounded-md border border-gray-300 cursor-pointer flex justify-between items-center"
                >
                  <span>{tags.length > 0 ? tags.join(", ") : "เลือกวิชา"}</span>
                  <span>▼</span>
                </div>

                {showTagList && (
                  <div className="absolute top-[45px] left-0 w-full border border-gray-300 rounded-md bg-white max-h-[200px] overflow-y-auto z-10">
                    {subjectTags.map((tag) => {
                      const selected = tags.includes(tag);

                      return (
                        <div
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          className={`p-2.5 cursor-pointer flex justify-between ${
                            selected ? "bg-blue-100" : "bg-white"
                          }`}
                        >
                          <span>{tag}</span>
                          {selected && <span>✓</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <input
                type="text"
                placeholder="Google Meet / Zoom"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                className="w-full p-2.5 rounded-md border border-gray-300"
              />

              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full p-2.5 rounded-md border border-gray-300"
              />

              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full p-2.5 rounded-md border border-gray-300"
              />
            </div>

            <div className="flex justify-between mt-[25px]">
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-gray-400 text-white rounded-md cursor-pointer"
              >
                Cancel
              </button>

              <button
                onClick={handleCreate}
                className="px-5 py-2 bg-blue-500 text-white rounded-md cursor-pointer"
              >
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}