"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface TutorRequest {
  _id: string;
  status: "pending" | "approved" | "rejected";
  rejectReason?: string;
  userId?: { name: string; surname: string; email: string };
  nationalId?: string;
  nickname?: string;
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
  tutorPhotoUrl?: string;
  paymentQrUrl?: string;
  ethnicity?: string;
  nationality?: string;
  religion?: string;
  birthDate?: string;
  academicStrength?: string;
}

interface PaymentRequest {
  _id: string;
  bookingId: string;
  paymentStatus: "pending" | "waiting_payment" | "slip_uploaded" | "paid" | "reject" | "transferred_to_tutor";
  price: number;
  slipUrl?: string;
  slipUploadedAt?: string;
  studentId?: { name: string; surname: string };
  tutorId?: { name: string; surname: string };
  courseId?: { title: string };
  wallet?: {
    promptpayNumber?: string;
    accountNumber?: string;
    bankName?: string;
  };
  tutorQr?: string;
}

const TUTOR_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "รอตรวจสอบ", color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
  approved: { label: "อนุมัติแล้ว", color: "bg-green-50 text-green-600 border-green-100" },
  rejected: { label: "ปฏิเสธแล้ว", color: "bg-red-50 text-red-600 border-red-100" },
};

const PAY_STATUS: Record<string, { label: string; color: string }> = {
  pending: { label: "รอชำระเงิน", color: "bg-gray-50 text-gray-500 border-gray-100" },
  waiting_payment: { label: "รอชำระเงิน", color: "bg-gray-50 text-gray-500 border-gray-100" },
  slip_uploaded: { label: "รอตรวจสลิป", color: "bg-yellow-50 text-yellow-600 border-yellow-100" },
  paid: { label: "เงินเข้าแล้ว", color: "bg-blue-50 text-blue-600 border-blue-100" },
  reject: { label: "สลิปไม่ผ่าน", color: "bg-red-50 text-red-600 border-red-100" },
  transferred_to_tutor: { label: "โอนให้ติวเตอร์", color: "bg-green-50 text-green-600 border-green-100" },
};

function formatDateTime(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminHome() {
  const [user, setUser] = useState<any>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [tutorData, setTutorData] = useState<TutorRequest[]>([]);
  const [payData, setPayData] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedTutor, setExpandedTutor] = useState<string | null>(null);
  const [expandedPay, setExpandedPay] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setUser)
      .catch(() => {
        window.location.href = "/login";
      });

    Promise.all([
      fetch("/api/admin/verify").then((r) => r.json()),
      fetch("/api/admin/payment").then((r) => r.json()),
    ]).then(([tutors, payments]) => {
      setTutorData(tutors);
      setPayData(payments);
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
  const pendingPayments = payData.filter((p) => p.paymentStatus === "slip_uploaded");
  const paidPayments = payData.filter((p) => p.paymentStatus === "paid");

  return (
    <div className="min-h-screen bg-orange-50 font-sans tracking-tight antialiased flex flex-col">
      {/* 1. แก้ไข Navbar */}
      <div className="flex justify-between items-center px-4 md:px-10 py-4 md:py-5 bg-[#FC5404] text-white shadow-md">
        <div className="flex items-center gap-2 md:gap-4">
          <Image src="/Edu_icon.png" alt="Logo" width={100} height={30} className="object-contain md:w-[120px] md:h-[35px]" />
          <div className="hidden md:block h-6 w-[1px] bg-white/30 ml-2"></div>
          <span className="hidden md:inline text-lg font-black tracking-tighter uppercase">Admin Dashboard</span>
        </div>

        <div className="flex items-center gap-3 md:gap-6">
          <button
            onClick={() => router.push("/home/admin/support")}
            className="bg-white/10 hover:bg-white/20 text-white px-3 md:px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 border border-white/20"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <span className="hidden sm:inline">คำร้อง </span>Support
          </button>

          <div className="flex items-center gap-3 group cursor-pointer relative" onClick={() => setShowMenu(!showMenu)}>
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-bold leading-none">{user?.name} {user?.surname}</p>
              <p className="text-[11px] text-white/70 font-medium">Administrator</p>
            </div>
            <div className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-white/20 border border-white/40 flex items-center justify-center font-bold text-white transition-transform group-hover:scale-105 uppercase">
              {user?.name?.[0]}
            </div>

            {showMenu && (
              <div className="absolute top-14 right-0 bg-white border border-orange-100 rounded-2xl shadow-xl p-2 w-40 z-50 animate-in fade-in zoom-in duration-150">
                <button
                  onClick={async () => {
                    await fetch("/api/logout", { method: "POST" });
                    window.location.href = "/";
                  }}
                  className="w-full text-left bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors"
                >
                  ออกจากระบบ
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-10 text-orange-300">
          <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-4"></div>
          <p className="font-bold animate-pulse">กำลังดึงข้อมูลระบบ...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 p-4 md:p-8 max-w-[1600px] mx-auto w-full">
          {/* 2. แก้ไขระยะห่างหน้าหลัก (p-4 md:p-8) - ย้ายคอมเมนต์เข้ามาในกล่องแล้ว */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-black text-[#1e3a5f] flex items-center gap-3">
                คำขอยืนยันติวเตอร์
                <span className="bg-orange-500 text-white text-sm px-2.5 py-0.5 rounded-full">{pendingTutors.length}</span>
              </h2>
            </div>

            <div className="space-y-4">
              {tutorData.length === 0 && (
                <div className="bg-white rounded-[32px] p-10 md:p-16 text-center border-2 border-orange-100 border-dashed text-gray-300 font-bold">ไม่มีรายการรอตรวจสอบติวเตอร์</div>
              )}

              {tutorData.map((item) => {
                const st = TUTOR_STATUS[item.status];
                const isOpen = expandedTutor === item._id;

                return (
                  <div key={item._id} className={`bg-white border rounded-[28px] overflow-hidden transition-all duration-300 ${isOpen ? "shadow-xl ring-1 ring-orange-200" : "shadow-sm hover:shadow-md border-orange-100"}`}>
                    <div onClick={() => setExpandedTutor(isOpen ? null : item._id)} className="p-4 md:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 cursor-pointer hover:bg-orange-50/30 transition-colors">
                      {/* 3. แก้ไขหัวการ์ดติวเตอร์ (flex-col sm:flex-row) */}
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-base md:text-lg uppercase shrink-0">
                          {item.userId?.name?.[0]}
                        </div>
                        <div>
                          <h3 className="font-black text-[#1e3a5f] text-base md:text-lg leading-tight">
                            {item.userId?.name} {item.userId?.surname}
                          </h3>
                          <p className="text-[11px] md:text-xs text-gray-400 font-medium tracking-wide break-all">{item.userId?.email}</p>
                        </div>
                      </div>
                      <span className={`px-4 py-1.5 rounded-xl text-[10px] md:text-[11px] font-extrabold border uppercase tracking-wider self-start sm:self-auto ${st.color}`}>{st.label}</span>
                    </div>

                    {isOpen && (
                      <div className="p-5 md:p-6 pt-0 border-t border-orange-50 bg-white">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mt-5 md:mt-6">
                          <div className="space-y-4">
                            <h4 className="text-[13px] font-black text-orange-500 uppercase tracking-widest border-b border-orange-100 pb-2">ข้อมูลส่วนบุคคล</h4>
                            <div className="grid grid-cols-1 gap-y-2">
                              <Field label="ชื่อ-สกุล (EN)" value={`${item.firstNameEN ?? ""} ${item.lastNameEN ?? ""}`} />
                              <Field label="ชื่อเล่น" value={item.nickname} />
                              <Field label="เลขบัตรประชาชน" value={item.nationalId} />
                              <Field label="จังหวัด" value={item.province} />
                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                <Field label="สัญชาติ" value={item.nationality} />
                                <Field label="ศาสนา" value={item.religion} />
                              </div>
                              <Field label="วันเกิด" value={item.birthDate ? new Date(item.birthDate).toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" }) : "-"} />
                            </div>
                          </div>

                          <div className="space-y-4">
                            <h4 className="text-[13px] font-black text-orange-500 uppercase tracking-widest border-b border-orange-100 pb-2">ประวัติการศึกษา</h4>
                            <div className="grid grid-cols-1 gap-y-2">
                              <Field label="ระดับ" value={item.educationLevel} />
                              <Field label="สถาบัน" value={item.university} />
                              <Field label="คณะ/สาขา" value={`${item.faculty} - ${item.major}`} />
                              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                                <Field label="GPA" value={item.gpa} />
                                <Field label="ประสบการณ์" value={item.tutorExp ? `${item.tutorExp} ปี` : "-"} />
                              </div>
                              <Field label="วิชาที่ถนัด" value={item.academicStrength} />
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 md:mt-8">
                          <h4 className="text-[13px] font-black text-[#1e3a5f] uppercase tracking-widest mb-3 md:mb-4">เอกสารประกอบการพิจารณา</h4>
                          <div className="flex flex-wrap gap-2 md:gap-3">
                            <DocLink url={item.idCardUrl} label="บัตรประชาชน" />
                            <DocLink url={item.certificateUrl} label="ประกาศนียบัตร" />
                            <DocLink url={item.transcriptUrl} label="Transcript" />
                            <DocLink url={item.resumeUrl} label="Resume" />
                            <DocLink url={item.tutorPhotoUrl} label="รูปโปรไฟล์" />
                            <DocLink url={item.paymentQrUrl} label="QR รับเงิน" />
                          </div>
                        </div>

                        {item.status === "rejected" && item.rejectReason && (
                          <div className="mt-5 md:mt-6 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700">
                            <p className="text-[11px] md:text-xs font-bold uppercase tracking-wider mb-1">เหตุผลที่ไม่ผ่าน</p>
                            <p className="text-sm font-semibold">{item.rejectReason}</p>
                          </div>
                        )}

                        {item.status === "pending" && (
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-6 md:mt-8">
                            {/* 4. แก้ไขปุ่มอนุมัติ/ปฏิเสธติวเตอร์ (flex-col sm:flex-row) */}
                            <button onClick={() => updateTutorStatus(item._id, "approved")} className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 md:py-3.5 rounded-2xl transition-all shadow-lg shadow-green-100 active:scale-95 text-sm md:text-base">
                              อนุมัติ
                            </button>
                            <button onClick={() => updateTutorStatus(item._id, "rejected")} className="flex-1 bg-white border-2 border-red-100 text-red-500 hover:bg-red-50 font-bold py-3 md:py-3.5 rounded-2xl transition-all active:scale-95 text-sm md:text-base">
                              ปฏิเสธ
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-black text-[#1e3a5f] flex items-center gap-3">
                ตรวจสอบสลิป
                <span className="bg-blue-500 text-white text-sm px-2.5 py-0.5 rounded-full">{pendingPayments.length}</span>
              </h2>
            </div>

            <div className="space-y-4">
              {[...pendingPayments, ...paidPayments].length === 0 && (
                <div className="bg-white rounded-[32px] p-10 md:p-16 text-center border-2 border-orange-100 border-dashed text-gray-300 font-bold">ไม่มีรายการสลิป</div>
              )}

              {[...pendingPayments, ...paidPayments].map((item) => {
                const st = PAY_STATUS[item.paymentStatus];
                const isOpen = expandedPay === item._id;
                const uploadedAt = formatDateTime(item.slipUploadedAt);

                return (
                  <div key={item._id} className={`bg-white border rounded-[28px] overflow-hidden transition-all duration-300 ${isOpen ? "shadow-xl ring-1 ring-blue-100" : "shadow-sm border-orange-100"}`}>
                    <div onClick={() => setExpandedPay(isOpen ? null : item._id)} className="p-4 md:p-5 cursor-pointer hover:bg-orange-50/30 transition-colors">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mb-2">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-wider ${st.color}`}>{st.label}</span>
                        <p className="font-black text-orange-500 text-base md:text-lg">฿{item.price.toLocaleString()}</p>
                      </div>
                      <h3 className="font-bold text-[#1e3a5f] text-sm md:text-base">
                        {item.studentId?.name} {item.studentId?.surname}
                      </h3>
                      <p className="text-[11px] md:text-xs text-gray-400 font-medium truncate">{item.courseId?.title}</p>
                    </div>

                    {isOpen && (
                      <div className="p-5 md:p-6 pt-0 border-t border-orange-50 bg-white">
                        <div className="mt-4 space-y-4">
                          <div className="bg-gray-50 rounded-2xl p-3 md:p-4 space-y-2">
                            <div className="flex flex-col sm:flex-row sm:justify-between text-[13px] md:text-sm">
                              <span className="text-gray-400 font-medium">ติวเตอร์:</span>
                              <span className="text-[#1e3a5f] font-bold">{item.tutorId?.name} {item.tutorId?.surname}</span>
                            </div>
                            <div className="flex flex-col sm:flex-row sm:justify-between text-[13px] md:text-sm">
                              <span className="text-gray-400 font-medium">คอร์ส:</span>
                              <span className="text-[#1e3a5f] font-bold sm:text-right sm:ml-4 leading-tight">{item.courseId?.title}</span>
                            </div>
                          </div>

                          {item.slipUrl && (
                            <div className="space-y-2">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <p className="text-[10px] md:text-[11px] font-black text-gray-400 uppercase tracking-widest">สลิปการโอน:</p>
                                {uploadedAt && (
                                  <span className="text-[10px] md:text-[11px] font-bold text-orange-400 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-xl self-start sm:self-auto">
                                    ส่งเมื่อ {uploadedAt}
                                  </span>
                                )}
                              </div>
                              <div className="relative group overflow-hidden rounded-2xl border-4 border-gray-50">
                                <img src={item.slipUrl} className="w-full h-auto" alt="Slip" />
                              </div>
                            </div>
                          )}

                          {item.paymentStatus === "slip_uploaded" && (
                            <div className="flex flex-col sm:flex-row gap-2 pt-4">
                              {/* 4. แก้ไขปุ่มอนุมัติ/ปฏิเสธสลิป (flex-col sm:flex-row) */}
                              <button
                                onClick={async () => {
                                  await fetch("/api/admin/payment", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ bookingId: item.bookingId, action: "approve" }),
                                  });
                                  setPayData((prev) => prev.map((p) => p.bookingId === item.bookingId ? { ...p, paymentStatus: "paid" } : p));
                                }}
                                className="flex-1 bg-[#FC5404] hover:bg-orange-600 text-white font-bold py-3 md:py-3.5 rounded-2xl shadow-lg shadow-orange-100 active:scale-95 transition-all text-sm md:text-base"
                              >
                                ยืนยันเงินเข้า
                              </button>
                              <button
                                onClick={async () => {
                                  await fetch("/api/admin/payment", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ bookingId: item.bookingId, action: "reject" }),
                                  });
                                  setPayData((prev) => prev.map((p) => p.bookingId === item.bookingId ? { ...p, paymentStatus: "reject" } : p));
                                }}
                                className="bg-white border-2 border-red-100 text-red-500 font-bold sm:px-6 py-3 md:py-3.5 rounded-2xl active:scale-95 transition-all w-full sm:w-auto text-sm md:text-base"
                              >
                                ไม่ผ่าน
                              </button>
                            </div>
                          )}

                          {item.paymentStatus === "paid" && (
                            <div className="space-y-4 pt-4 border-t border-orange-50">
                              {item.tutorQr && (
                                <div className="space-y-2">
                                  <p className="text-[10px] md:text-[11px] font-black text-[#1e3a5f] uppercase tracking-widest">QR โอนเงินให้ติวเตอร์:</p>
                                  <div className="p-2 bg-gray-50 rounded-2xl border border-gray-100 w-full sm:w-1/2 mx-auto">
                                    <img src={item.tutorQr} className="w-full rounded-xl" alt="Tutor QR" />
                                  </div>
                                </div>
                              )}
                              <button
                                onClick={async () => {
                                  await fetch("/api/admin/payment", {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ bookingId: item.bookingId, action: "transfer" }),
                                  });
                                  setPayData((prev) => prev.map((p) => p.bookingId === item.bookingId ? { ...p, paymentStatus: "transferred_to_tutor" } : p));
                                }}
                                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3.5 md:py-4 rounded-2xl shadow-lg shadow-orange-100 active:scale-95 transition-all text-sm md:text-base"
                              >
                                โอนเงินให้ติวเตอร์สำเร็จแล้ว
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value?: any }) {
  return (
    <div className="flex flex-col">
      <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter mb-0.5">{label}</span>
      <span className="text-[13px] md:text-[14px] text-[#1e3a5f] font-bold leading-tight break-words">{value || "-"}</span>
    </div>
  );
}

function DocLink({ url, label }: { url?: string; label: string }) {
  if (!url) return null;
  return (
    <a
      href={url}
      target="_blank"
      className="px-3 py-2 bg-white border border-orange-100 hover:border-orange-400 hover:text-orange-600 rounded-xl text-[11px] md:text-xs font-bold text-gray-500 transition-all flex items-center gap-1.5 md:gap-2 shadow-sm w-full sm:w-auto justify-center"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
      </svg>
      {label}
    </a>
  );
}