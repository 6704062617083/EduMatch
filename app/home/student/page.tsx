"use client";
import { useState, useEffect } from "react";

export default function StudentHome() {
  const [courses, setCourses] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }

    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      const res = await fetch("/api/courses");
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error(error);
    }
  }

  async function handleBooking(courseId: string) {
    if (!user) {
      alert("Please login first");
      return;
    }

    const res = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        courseId,
        studentId: user._id,
      }),
    });

    if (!res.ok) {
      alert("Booking failed");
      return;
    }

    alert("Booking request sent");
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
        <span>คอร์สเรียน</span>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "16px", fontWeight: "normal" }}>
            {user?.username} {user?.surname}
          </span>

          <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center" }}>
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

      <div style={{ padding: "40px" }}>
        <h2>Available Courses</h2>

        {courses.length === 0 && <p>No courses available</p>}

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

            <p>
              Tutor: {course.tutor?.username} {course.tutor?.surname}
            </p>

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
                <a href={course.classLink} target="_blank">
                  {course.classLink}
                </a>
              </p>
            )}

            <button style={bookBtn} onClick={() => handleBooking(course._id)}>
              จองเรียน
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const bookBtn = {
  padding: "8px 20px",
  background: "#2a0edd",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};