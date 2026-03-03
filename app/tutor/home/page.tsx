"use client";
import { useState, useEffect } from "react";

export default function TutorHome() {
  const [showModal, setShowModal] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [courses, setCourses] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }

  async function handleCreate() {
    try {
      const method = editingId ? "PUT" : "POST";
      const url = editingId
        ? `/api/courses/${editingId}`
        : "/api/courses";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: courseName,
          description,
          startTime,
          endTime,
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
      setEditingId(null);

      fetchCourses();
    } catch (error) {
      console.error("Create/Update error:", error);
    }
  }

  async function handleDelete(id: string) {
    try {
      console.log("Deleting ID:", id);

      const res = await fetch(`/api/courses/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      console.log("Delete response:", data);

      if (!res.ok) {
        alert("Delete failed");
        return;
      }

      // ลบออกจาก UI ทันที
      setCourses((prev) => prev.filter((c) => c._id !== id));
    } catch (error) {
      console.error("Delete error:", error);
      alert("Something went wrong");
    }
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "20px 40px",
          fontSize: "22px",
          fontWeight: "bold",
          borderBottom: "1px solid #ddd",
        }}
      >
        ติวเตอร์
      </div>

      <div style={{ display: "flex", flex: 1 }}>
        {/* LEFT */}
        <div style={{ flex: 1, padding: "40px" }}>
          <h2>All Courses</h2>

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
              <h3>{course.title}</h3>
              <p>ID: {course._id}</p>

              <button
                onClick={() => {
                  setEditingId(course._id);
                  setCourseName(course.title);
                  setDescription(course.description || "");
                  setStartTime(course.startTime?.slice(0, 16));
                  setEndTime(course.endTime?.slice(0, 16));
                  setShowModal(true);
                }}
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(course._id)}
                style={{ marginLeft: "10px", color: "red" }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>

        {/* RIGHT */}
        <div
          style={{
            width: "250px",
            padding: "40px 60px 40px 0",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-start",
          }}
        >
          <button
            onClick={() => {
              setEditingId(null);
              setShowModal(true);
            }}
            style={createBtn}
          >
            + Create
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h2 style={{ marginBottom: "20px" }}>
              {editingId ? "Edit Course" : "Create Course"}
            </h2>

            <input
              type="text"
              placeholder="Course Name"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              style={inputStyle}
            />

            <textarea
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ ...inputStyle, height: "80px" }}
            />

            <label>Start Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={inputStyle}
            />

            <label>End Time</label>
            <input
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              style={inputStyle}
            />

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "20px" }}>
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
  width: "500px",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
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

const cancelBtn = {
  padding: "8px 20px",
  background: "#aaa",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};