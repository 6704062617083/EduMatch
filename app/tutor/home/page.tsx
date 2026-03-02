"use client";
import { useState } from "react";

export default function TutorHome() {
  const [showModal, setShowModal] = useState(false);
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  function handleCreate() {
    const newCourse = {
      courseName,
      description,
      startTime,
      endTime,
    };

    console.log(newCourse);
    setShowModal(false);
    setCourseName("");
    setDescription("");
    setStartTime("");
    setEndTime("");
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* TOP BAR */}
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

      {/* MAIN CONTENT */}
      <div style={{ display: "flex", flex: 1 }}>
        
        {/* LEFT SIDE */}
        <div
          style={{
            flex: 1,
            padding: "40px",
          }}
        >
          <h2>All Courses</h2>
          <p>No courses yet</p>
        </div>

        {/* RIGHT SIDE */}
        <div
          style={{
            width: "250px",
            padding: "40px 60px 40px 0", // เขยิบปุ่มเข้ามา
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "flex-start",
          }}
        >
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: "10px 20px",
              background: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            + Create
          </button>
        </div>
      </div>

      {/* MODAL */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "40px",
              borderRadius: "12px",
              width: "500px", // ทำให้ใหญ่ขึ้น
            }}
          >
            <h2 style={{ marginBottom: "20px" }}>Create Course</h2>

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

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: "20px",
              }}
            >
              <button onClick={() => setShowModal(false)} style={cancelBtn}>
                Cancel
              </button>

              <button onClick={handleCreate} style={createBtn}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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