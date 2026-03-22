"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const STATUS_LABEL: Record<string, string> = {
  pending:  "⏳ รอการยืนยัน",
  approved: "✅ อนุมัติแล้ว",
  rejected: "❌ ปฏิเสธแล้ว",
};

const STATUS_COLOR: Record<string, string> = {
  pending:  "text-yellow-600",
  approved: "text-green-600",
  rejected: "text-red-600",
};

const viewUrl = (url: string) => url || "#";


export default function AdminVerifyPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/admin/verify")
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false); });
  }, []);

  const updateStatus = async (id: string, status: string) => {
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
    setData(prev => prev.map(item => (item._id === id ? updated : item)));
  };

  if (loading) return <div className="p-10 text-gray-500">กำลังโหลด...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-2xl font-bold mb-6">Admin — คำขอยืนยันติวเตอร์</h1>
      <button onClick={() => router.push("/home/admin")} className="text-blue-500 hover:underline mb-4 block">
        ← ย้อนกลับ
      </button>

      {data.length === 0 && (
        <p className="text-gray-500">ยังไม่มีคำขอ</p>
      )}

      <div className="space-y-6">
        {data.map(item => (
          <div key={item._id} className="bg-white border p-6 rounded-xl shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">
                {item.userId?.name} {item.userId?.surname}
              </h2>
              <span className={`font-medium ${STATUS_COLOR[item.status] ?? ""}`}>
                {STATUS_LABEL[item.status] ?? item.status}
              </span>
            </div>

            {/* ข้อมูลส่วนบุคคล */}
            <h3 className="font-semibold text-gray-700 mb-2">ข้อมูลส่วนบุคคล</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm mb-4">
              <Field label="อีเมล"               value={item.userId?.email} />
              <Field label="เลขบัตรประชาชน"      value={item.nationalId} />
              <Field label="ชื่อ-สกุล (EN)"      value={`${item.firstNameEN ?? ""} ${item.lastNameEN ?? ""}`} />
              <Field label="จังหวัด"              value={item.province} />
              <Field label="เชื้อชาติ"            value={item.ethnicity} />
              <Field label="สัญชาติ"              value={item.nationality} />
              <Field label="ศาสนา"               value={item.religion} />
              <Field label="วันเกิด"              value={item.birthDate ? new Date(item.birthDate).toLocaleDateString("th-TH") : "-"} />
              <Field label="ส่วนสูง"              value={item.height ? `${item.height} cm` : "-"} />
              <Field label="น้ำหนัก"              value={item.weight ? `${item.weight} kg` : "-"} />
              <Field label="หมู่โลหิต"            value={item.bloodType} />
              <Field label="สถานภาพสมรส"         value={item.maritalStatus} />
              <Field label="ความถนัดทางวิชาการ"   value={item.academicStrength} />
            </div>

            {/* การศึกษา */}
            <h3 className="font-semibold text-gray-700 mb-2">การศึกษา</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-sm mb-4">
              <Field label="ระดับการศึกษา"   value={item.educationLevel} />
              <Field label="สถาบัน"           value={item.university} />
              <Field label="คณะ"              value={item.faculty} />
              <Field label="สาขา"             value={item.major} />
              <Field label="GPA"              value={item.gpa} />
              <Field label="ประสบการณ์สอน"   value={item.tutorExp ? `${item.tutorExp} ปี` : "-"} />
            </div>

            {/* เอกสารแนบ */}
            <h3 className="font-semibold text-gray-700 mb-2">เอกสารแนบ</h3>
            <div className="flex flex-wrap gap-3 mb-4">
              {item.idCardUrl && (
                <a href={viewUrl(item.idCardUrl)} target="_blank" rel="noreferrer"
                  className="bg-blue-50 text-blue-600 border border-blue-300 px-3 py-1 rounded text-sm hover:bg-blue-100">
                  📄 บัตรประชาชน
                </a>
              )}
              {item.certificateUrl && (
                <a href={viewUrl(item.certificateUrl)} target="_blank" rel="noreferrer"
                  className="bg-blue-50 text-blue-600 border border-blue-300 px-3 py-1 rounded text-sm hover:bg-blue-100">
                  🎓 ประกาศนียบัตร
                </a>
              )}
              {item.transcriptUrl && (
                <a href={viewUrl(item.transcriptUrl)} target="_blank" rel="noreferrer"
                  className="bg-blue-50 text-blue-600 border border-blue-300 px-3 py-1 rounded text-sm hover:bg-blue-100">
                  📋 Transcript
                </a>
              )}
              {item.resumeUrl && (
                <a href={viewUrl(item.resumeUrl)} target="_blank" rel="noreferrer"
                  className="bg-blue-50 text-blue-600 border border-blue-300 px-3 py-1 rounded text-sm hover:bg-blue-100">
                  📝 Resume
                </a>
              )}
            </div>

            {/* เหตุผลปฏิเสธ */}
            {item.status === "rejected" && item.rejectReason && (
              <div className="bg-red-50 border border-red-200 rounded p-3 mb-4 text-sm text-red-700">
                <b>เหตุผลที่ปฏิเสธ:</b> {item.rejectReason}
              </div>
            )}

            {/* Actions */}
            {item.status === "pending" && (
              <div className="flex gap-3">
                <button
                  onClick={() => updateStatus(item._id, "approved")}
                  className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded"
                >
                  ✅ Approve
                </button>
                <button
                  onClick={() => updateStatus(item._id, "rejected")}
                  className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded"
                >
                  ❌ Reject
                </button>
              </div>
            )}

          </div>
        ))}
      </div>
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