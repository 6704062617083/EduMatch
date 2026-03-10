"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

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
    "TGAT3"
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      fetchCourses(parsedUser._id);
    }
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
        <span>ติวเตอร์</span>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "16px", fontWeight: "normal" }}>
            {user?.username} {user?.surname}
          </span>

          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                border: "2px solid black",
                cursor: "pointer",
              }}
            ></div>

            <div style={{ fontSize: "12px", marginTop: "4px" }}>
              {user?.role}
            </div>

            {showMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "60px",
                  right: "0",
                  background: "white",
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "10px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                }}
              >
                <button
                  onClick={handleLogout}
                  style={{
                    background: "#ff4d4f",
                    color: "white",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ flex: 1, padding: "40px" }}>
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
              }}
            >
              <h3
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  marginBottom: "6px",
                  color: "#111",
                }}
              >
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

              <p style={{ fontWeight: "bold" }}>
                ราคา: {course.price?.toLocaleString()} บาท
              </p>

              <div style={{ marginBottom: "10px" }}>
                {course.tags?.map((tag: string) => (
                  <span
                    key={tag}
                    style={{
                      background: "#e6f0ff",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "12px",
                      marginRight: "5px",
                    }}
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

              <div style={{ marginTop: "10px" }}>
                <button
                  style={editBtn}
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
                  style={deleteBtn}
                  onClick={() => handleDelete(course._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        <div
          style={{
            width: "250px",
            padding: "40px 60px 40px 0",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
          }}
        >
          <button
            onClick={() => {
              setEditingId(null);
              setShowModal(true);
            }}
            style={{
              ...createBtn,
              marginTop: "30px",
            }}
          >
            + Create course
          </button>

          <Link href="/home/tutor/verify">
            <button
              style={{
                ...createBtn,
                marginTop: "10px",
                background: "#555",
              }}
            >
              Verify account
            </button>
          </Link>

          <Link href="/home/tutor/request">
            <button
              style={{
                ...createBtn,
                marginTop: "10px",
                background: "#2a0edd",
              }}
            >
              Booking request
            </button>
          </Link>
        </div>
      </div>

      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginBottom: "20px" }}>
              {editingId ? "Edit Course" : "Create Course"}
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "15px",
              }}
            >
              <input
                type="text"
                placeholder="Course Name"
                value={courseName}
                onChange={(e) => setCourseName(e.target.value)}
                style={inputStyle}
              />

              <input
                type="number"
                placeholder="ราคา"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                style={inputStyle}
                required
              />

              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...inputStyle, gridColumn: "span 2", height: "80px" }}
              />

              <div style={{ position: "relative" }}>
                <div
                  onClick={() => setShowTagList(!showTagList)}
                  style={{
                    ...inputStyle,
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span>{tags.length > 0 ? tags.join(", ") : "เลือกวิชา"}</span>
                  <span>▼</span>
                </div>

                {showTagList && (
                  <div
                    style={{
                      position: "absolute",
                      top: "45px",
                      left: 0,
                      width: "100%",
                      border: "1px solid #ccc",
                      borderRadius: "6px",
                      background: "white",
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 10,
                    }}
                  >
                    {subjectTags.map((tag) => {
                      const selected = tags.includes(tag);

                      return (
                        <div
                          key={tag}
                          onClick={() => toggleTag(tag)}
                          style={{
                            padding: "10px",
                            cursor: "pointer",
                            display: "flex",
                            justifyContent: "space-between",
                            background: selected ? "#e6f0ff" : "white",
                          }}
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
                style={inputStyle}
              />

              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={inputStyle}
              />

              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "25px",
              }}
            >
              <button onClick={() => setShowModal(false)} style={cancelBtn}>
                Cancel
              </button>

              <button onClick={handleCreate} style={createBtn}>
                {editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const overlayStyle = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalStyle = {
  background: "white",
  padding: "40px",
  borderRadius: "12px",
  width: "700px",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const createBtn = {
  padding: "8px 20px",
  background: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const editBtn = {
  padding: "6px 15px",
  background: "#0070f3",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  marginRight: "10px",
};

const deleteBtn = {
  padding: "6px 15px",
  background: "#ff4d4f",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const cancelBtn = {
  padding: "8px 20px",
  background: "#aaa",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};