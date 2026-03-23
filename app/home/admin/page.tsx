"use client";

import { useState, useEffect } from "react";

interface TutorRequest {
  _id: string;
  status: "pending" | "approved" | "rejected";
  rejectReason?: string;
  userId?: { name: string; surname: string; email: string };
  nationalId?: string;
  firstNameEN?: string;
  lastNameEN?: string;
  province?: string;
  educationLevel?: string;
  university?: string;
  faculty?: string;
  major?: string;
  gpa?: string;
  tutorExp?: number;
  idCardUrl?: string;
  certificateUrl?: string;
  transcriptUrl?: string;
  resumeUrl?: string;
  ethnicity?: string;
  nationality?: string;
  religion?: string;
  birthDate?: string;
  academicStrength?: string;
}

interface PaymentRequest {
  _id: string;
  paymentStatus: "pending" | "slip_uploaded" | "verified" | "failed";
  amount: number;
  slipUrl?: string;
  slipUploadedAt?: string;
  studentId?: { name: string; surname: string };
  tutorId?: { name: string; surname: string };
  courseId?: { title: string };
}

const TUTOR_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "รอตรวจสอบ", color: "bg-yellow-100 text-yellow-700" },
  approved: { label: "อนุมัติแล้ว", color: "bg-green-100 text-green-700" },
  rejected: { label: "ปฏิเสธแล้ว", color: "bg-red-100 text-red-700" },
};

const PAY_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "รอชำระเงิน", color: "bg-gray-100 text-gray-600" },
  slip_uploaded: { label: "รอตรวจสลิป", color: "bg-yellow-100 text-yellow-700" },
  verified: { label: "ยืนยันแล้ว", color: "bg-green-100 text-green-700" },
  failed: { label: "ไม่ผ่าน", color: "bg-red-100 text-red-700" },
};

export default function AdminHome() {
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [tutorData, setTutorData] = useState<TutorRequest[]>([]);
  const [payData, setPayData] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTutor, setExpandedTutor] = useState<string | null>(null);
  const [expandedPay, setExpandedPay] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setUser)
      .catch(() => {
        window.location.href = "/login";
      });

    Promise.all([
      fetch("/api/admin/verify").then((r) => r.json()),
    ]).then(([tutors]) => {
      setTutorData(tutors);
      setPayData([]);
      setLoading(false);
    });
  }, []);

  const updateTutorStatus = async (id: string, status: string) => {
    let rejectReason = "";
    if (status === "rejected") {
      rejectReason = prompt("เหตุผลที่ไม่ผ่าน") || "";
      if (!rejectReason) return;
    }
    const res = await fetch(`/api/admin/verify/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, rejectReason }),
    });
    const updated = await res.json();
    setTutorData((prev) => prev.map((t) => (t._id === id ? updated : t)));
  };

  const pendingTutors = tutorData.filter((t) => t.status === "pending");
  const pendingPayments = payData.filter(
    (p) => p.paymentStatus === "slip_uploaded"
  );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex justify-between items-center px-10 py-4 border-b">
        <span className="text-xl font-bold">Admin</span>

        <div className="flex items-center gap-3">
          <span className="text-sm">
            {user?.name} {user?.surname}
          </span>

          <div className="relative flex flex-col items-center">
            <div
              onClick={() => setShowMenu(!showMenu)}
              className="w-10 h-10 rounded-full border-2 border-black cursor-pointer"
            ></div>

            {showMenu && (
              <div className="absolute top-14 right-0 bg-white border rounded-lg shadow p-2">
                <button
                  onClick={async () => {
                    await fetch("/api/logout", { method: "POST" });
                    window.location.href = "/";
                  }}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-10 text-center text-gray-400">กำลังโหลด...</div>
      ) : (
        <div className="flex flex-1">
          <div className="flex-1 p-10">
            <h2 className="text-2xl font-bold mb-4">
              คำขอยืนยันติวเตอร์ ({pendingTutors.length})
            </h2>

            {tutorData.length === 0 && (
              <p className="text-gray-400">ยังไม่มีคำขอ</p>
            )}

            {tutorData.map((item) => {
              const st = TUTOR_STATUS[item.status];
              const isOpen = expandedTutor === item._id;

              return (
                <div
                  key={item._id}
                  className="border rounded-xl p-5 mb-4 shadow-sm"
                >
                  <div
                    onClick={() =>
                      setExpandedTutor(isOpen ? null : item._id)
                    }
                    className="flex justify-between cursor-pointer"
                  >
                    <div>
                      <h3 className="font-bold text-lg">
                        {item.userId?.name} {item.userId?.surname}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {item.userId?.email}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs ${st.color}`}
                    >
                      {st.label}
                    </span>
                  </div>

                  {isOpen && (
                    <div className="mt-4 text-sm space-y-4">

                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2">ข้อมูลส่วนบุคคล</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                          <Field label="อีเมล" value={item.userId?.email} />
                          <Field label="เลขบัตรประชาชน" value={item.nationalId} />
                          <Field label="ชื่อ-สกุล (EN)" value={`${item.firstNameEN ?? ""} ${item.lastNameEN ?? ""}`} />
                          <Field label="จังหวัด" value={item.province} />
                          <Field label="เชื้อชาติ" value={item.ethnicity} />
                          <Field label="สัญชาติ" value={item.nationality} />
                          <Field label="ศาสนา" value={item.religion} />
                          <Field label="วันเกิด" value={item.birthDate ? new Date(item.birthDate).toLocaleDateString("th-TH") : "-"} />
                          <Field label="ความถนัดทางวิชาการ" value={item.academicStrength} />
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2">การศึกษา</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1">
                          <Field label="ระดับการศึกษา" value={item.educationLevel} />
                          <Field label="สถาบัน" value={item.university} />
                          <Field label="คณะ" value={item.faculty} />
                          <Field label="สาขา" value={item.major} />
                          <Field label="GPA" value={item.gpa} />
                          <Field label="ประสบการณ์สอน" value={item.tutorExp ? `${item.tutorExp} ปี` : "-"} />
                        </div>
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-700 mb-2">เอกสาร</h3>
                        <div className="flex flex-wrap gap-2">
                          {item.idCardUrl && (
                            <a href={item.idCardUrl} target="_blank" className="bg-blue-50 text-blue-600 border border-blue-300 px-3 py-1 rounded text-sm">
                              บัตรประชาชน
                            </a>
                          )}
                          {item.certificateUrl && (
                            <a href={item.certificateUrl} target="_blank" className="bg-blue-50 text-blue-600 border border-blue-300 px-3 py-1 rounded text-sm">
                              ประกาศนียบัตร
                            </a>
                          )}
                          {item.transcriptUrl && (
                            <a href={item.transcriptUrl} target="_blank" className="bg-blue-50 text-blue-600 border border-blue-300 px-3 py-1 rounded text-sm">
                              Transcript
                            </a>
                          )}
                          {item.resumeUrl && (
                            <a href={item.resumeUrl} target="_blank" className="bg-blue-50 text-blue-600 border border-blue-300 px-3 py-1 rounded text-sm">
                              Resume
                            </a>
                          )}
                        </div>
                      </div>

                      {item.status === "rejected" && item.rejectReason && (
                        <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700">
                          เหตุผล: {item.rejectReason}
                        </div>
                      )}

                      {item.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              updateTutorStatus(item._id, "approved")
                            }
                            className="bg-green-600 text-white px-4 py-2 rounded"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              updateTutorStatus(item._id, "rejected")
                            }
                            className="bg-red-500 text-white px-4 py-2 rounded"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex-1 p-10 border-l">
            <h2 className="text-2xl font-bold mb-4">
              คำขอยืนยันการชำระเงิน ({pendingPayments.length})
            </h2>

            {payData.length === 0 && (
              <p className="text-gray-400">ยังไม่มีสลิป</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: any }) {
  return (
    <div>
      <span className="text-gray-500">{label}: </span>
      <span className="text-gray-900">{value || "-"}</span>
    </div>
  );
}
