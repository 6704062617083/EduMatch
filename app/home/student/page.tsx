"use client";
import { useState, useEffect } from "react";

const SUBJECT_TAGS = [
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

  useEffect(() => {
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    }

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
    } catch (error) {
      console.error(error);
    }
  }

  function handleSearch(keyword: string) {
    const lower = keyword.toLowerCase();

    const filtered = courses.filter((course: any) => {
      const title = course.title?.toLowerCase() || "";
      const tutor =
        (course.tutor?.name + " " + course.tutor?.surname)?.toLowerCase() || "";
      const tags = course.tags?.join(" ").toLowerCase() || "";

      const matchSearch =
        title.includes(lower) ||
        tutor.includes(lower) ||
        tags.includes(lower);

      const matchTag = tagFilter ? course.tags?.includes(tagFilter) : true;

      const matchMinPrice = minPrice
        ? course.price >= Number(minPrice)
        : true;

      const matchMaxPrice = maxPrice
        ? course.price <= Number(maxPrice)
        : true;

      return matchSearch && matchTag && matchMinPrice && matchMaxPrice;
    });

    setFilteredCourses(filtered);
  }

  function openDetail(course: any) {
    setSelectedCourse(course);
    setShowDetail(true);
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

      <div style={{ padding: "40px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
          <input
            type="text"
            placeholder="ค้นหาคอร์ส / ชื่อติวเตอร์ / วิชา"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "6px",
              border: "1px solid #ccc",
            }}
          />

          <button
            onClick={() => setShowFilter(true)}
            style={{
              padding: "10px 16px",
              borderRadius: "6px",
              border: "1px solid #ccc",
              cursor: "pointer",
              background: "white",
            }}
          >
            Filter
          </button>
        </div>

        <h2 style={{ marginBottom: "20px" }}>Available Courses</h2>

        {filteredCourses.length === 0 && <p>No courses available</p>}

        {filteredCourses.map((course: any) => (
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
                fontSize: "22px",
                fontWeight: "bold",
                marginBottom: "8px",
              }}
            >
              {course.title}
            </h3>

            <p>
              Tutor: {course.tutor?.name} {course.tutor?.surname}
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

            <div style={{ display: "flex", gap: "10px" }}>
              <button style={detailBtn} onClick={() => openDetail(course)}>
                รายละเอียด
              </button>

              <button style={profileBtn}>ติวเตอร์โปรไฟล์</button>

              <button style={bookBtn}>
                จองเรียน
              </button>
            </div>
          </div>
        ))}
      </div>

      {showDetail && selectedCourse && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              width: "500px",
              maxWidth: "90%",
            }}
          >
            <p style={{ fontWeight: "bold" }}>ชื่อคอร์ส</p>
            <p>{selectedCourse.title}</p>

            <p style={{ fontWeight: "bold", marginTop: "10px" }}>ติวเตอร์</p>
            <p>
              {selectedCourse.tutor?.name} {selectedCourse.tutor?.surname}
            </p>

            <p style={{ fontWeight: "bold", marginTop: "10px" }}>ราคา</p>
            <p>{selectedCourse.price?.toLocaleString()} บาท</p>

            <p style={{ fontWeight: "bold", marginTop: "10px" }}>เวลาเรียน</p>
            <p>
              {new Date(selectedCourse.startTime).toLocaleString()} -{" "}
              {new Date(selectedCourse.endTime).toLocaleString()}
            </p>

            <p style={{ fontWeight: "bold", marginTop: "10px" }}>
              รายละเอียดคอร์ส
            </p>
            <p style={{ lineHeight: "1.5" }}>
              {selectedCourse.description}
            </p>

            <button
              onClick={() => setShowDetail(false)}
              style={{
                marginTop: "20px",
                padding: "8px 16px",
                background: "#ff6a00",
                color: "white",
                border: "none",
                borderRadius: "6px",
              }}
            >
              ปิด
            </button>
          </div>
        </div>
      )}

      {showFilter && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "25px",
              borderRadius: "12px",
              width: "500px",
              maxWidth: "90%",
            }}
          >
            <h3 style={{ marginBottom: "15px" }}>Filter</h3>

            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                marginBottom: "15px",
                borderRadius: "6px",
                border: "1px solid #ccc",
              }}
            >
              <option value="">ทุกวิชา</option>
              {SUBJECT_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>

            <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
              <input
                type="number"
                placeholder="Min price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />

              <input
                type="number"
                placeholder="Max price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                onClick={() => setShowFilter(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  background: "white",
                }}
              >
                Cancel
              </button>

              <button
                onClick={() => setShowFilter(false)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "none",
                  background: "#ff6a00",
                  color: "white",
                }}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
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

const detailBtn = {
  padding: "8px 16px",
  background: "#555",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

const profileBtn = {
  padding: "8px 16px",
  background: "#00a86b",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};