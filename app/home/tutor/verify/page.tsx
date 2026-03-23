"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TutorVerify() {

  const [form, setForm] = useState({
    email: "",
    name: "",
    surname: "",
    phone: "",
    idCardNumber: "",
    firstNameEN: "",
    lastNameEN: "",
    province: "",
    ethnicity: "",
    nationality: "",
    religion: "",
    birthDate: "",
    academicStrength: "",
    educationLevel: "",
    university: "",
    faculty: "",
    major: "",
    gpa: "",
    tutorExp: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [idCard, setIdCard] = useState<File | null>(null);
  const [certificate, setCertificate] = useState<File | null>(null);
  const [transcript, setTranscript] = useState<File | null>(null);
  const [resume, setResume] = useState<File | null>(null);

  const router = useRouter();
  const MAX_SIZE = 5 * 1024 * 1024;
  const [verifyStatus, setVerifyStatus] = useState<string>("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (file: File | null, setter: (f: File | null) => void) => {
    if (!file) return;
    if (file.size > MAX_SIZE) {
      alert("ไฟล์ต้องไม่เกิน 5MB");
      return;
    }
    setter(file);
  };

  useEffect(() => {
    fetch("/api/me")
      .then(res => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then(data => {
        setForm(prev => ({
          ...prev,
          email: data.email || "",
          name: data.name || "",
          surname: data.surname || "",
          phone: data.phone || "",
        }));
      })
      .catch(() => router.push("/login"));

    fetch("/api/tutor/verify/status")
      .then(res => res.json())
      .then(doc => {
        if (!doc) return;

        setVerifyStatus(doc.status);
        setIsSubmitted(doc.status !== "rejected");

        setForm(prev => ({
          ...prev,
          idCardNumber:     doc.nationalId       || "",
          firstNameEN:      doc.firstNameEN      || "",
          lastNameEN:       doc.lastNameEN       || "",
          province:         doc.province         || "",
          ethnicity:        doc.ethnicity        || "",
          nationality:      doc.nationality      || "",
          religion:         doc.religion         || "",
          birthDate:        doc.birthDate ? doc.birthDate.split("T")[0] : "",
          academicStrength: doc.academicStrength || "",
          educationLevel:   doc.educationLevel   || "",
          university:       doc.university       || "",
          faculty:          doc.faculty          || "",
          major:            doc.major            || "",
          gpa:              doc.gpa?.toString()       || "",
          tutorExp:         doc.tutorExp?.toString()  || "",
        }));
      });
  }, []);

  const isValidThaiID = (id: string) => {
    if (!/^\d{13}$/.test(id)) return false;
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(id[i]) * (13 - i);
    }
    const checkDigit = (11 - (sum % 11)) % 10;
    return checkDigit === parseInt(id[12]);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const requiredFields: Record<string, string> = {
      idCardNumber:     "รหัสบัตรประชาชน",
      firstNameEN:      "ชื่อ (English)",
      lastNameEN:       "นามสกุล (English)",
      province:         "จังหวัดที่อาศัย",
      ethnicity:        "เชื้อชาติ",
      nationality:      "สัญชาติ",
      religion:         "ศาสนา",
      birthDate:        "วันเกิด",
      academicStrength: "ความถนัดทางวิชาการ",
      educationLevel:   "ระดับการศึกษา",
      university:       "ชื่อสถาบันการศึกษา",
      faculty:          "คณะ",
      major:            "สาขาวิชา",
      gpa:              "เกรดเฉลี่ย",
      tutorExp:         "ประสบการณ์สอน",
    };

    for (const [field] of Object.entries(requiredFields)) {
      if (!(form as any)[field]) {
        newErrors[field] = `โปรดกรอกฟิลด์นี้`;
      }
    }

    if (!idCard) newErrors.idCard = "กรุณาแนบไฟล์บัตรประชาชน";
    if (!certificate) newErrors.certificate = "กรุณาแนบไฟล์ประกาศนียบัตร";
    if (!transcript) newErrors.transcript = "กรุณาแนบไฟล์ Transcript";
    if (!resume) newErrors.resume = "กรุณาแนบไฟล์ Resume";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    if (form.idCardNumber.length !== 13) {
      alert("กรุณากรอกเลขบัตร 13 หลัก");
      return;
    }
    if (!isValidThaiID(form.idCardNumber)) {
      alert("เลขบัตรประชาชนไม่ถูกต้อง");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nationalId",       form.idCardNumber);
      formData.append("firstNameEN",      form.firstNameEN);
      formData.append("lastNameEN",       form.lastNameEN);
      formData.append("province",         form.province);
      formData.append("ethnicity",        form.ethnicity);
      formData.append("nationality",      form.nationality);
      formData.append("religion",         form.religion);
      formData.append("birthDate",        form.birthDate);
      formData.append("academicStrength", form.academicStrength);
      formData.append("educationLevel",   form.educationLevel);
      formData.append("university",       form.university);
      formData.append("faculty",          form.faculty);
      formData.append("major",            form.major);
      formData.append("gpa",              form.gpa);
      formData.append("tutorExp",         form.tutorExp);

      if (idCard)      formData.append("idCard",      idCard);
      if (certificate) formData.append("certificate", certificate);
      if (transcript)  formData.append("transcript",  transcript);
      if (resume)      formData.append("resume",      resume);

      const res = await fetch("/api/tutor/verify", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "เกิดข้อผิดพลาด");
        return;
      }

      alert("ส่งข้อมูลสำเร็จ รอการยืนยันจากแอดมิน");
      router.push("/home/tutor/status");

    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  const label = (text: string) => (
    <label className="text-sm text-gray-600 mb-1">{text}</label>
  );

  const lockedInput = (labelText: string, field: string) => (
    <div className="flex flex-col">
      {label(labelText)}
      <input
        placeholder={labelText}
        className="border p-2 rounded bg-gray-100 cursor-not-allowed"
        value={(form as any)[field]}
        readOnly
      />
    </div>
  );

  const freeInput = (labelText: string, field: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="flex flex-col">
      {label(labelText)}
      <input
        placeholder={labelText}
        className={`border p-2 rounded ${isSubmitted ? "bg-gray-100 cursor-not-allowed" : ""} ${errors[field] ? "border-red-500" : ""}`}
        value={(form as any)[field]}
        onChange={e => !isSubmitted && handleChange(field, e.target.value)}
        readOnly={isSubmitted}
        {...extra}
      />
      {errors[field] && <span className="text-red-500 text-xs mt-1">{errors[field]}</span>}
    </div>
  );

  const numericInput = (labelText: string, field: string, maxLen: number) => (
    <div className="flex flex-col">
      {label(labelText)}
      <input
        placeholder={labelText}
        className={`border p-2 rounded ${isSubmitted ? "bg-gray-100 cursor-not-allowed" : ""} ${errors[field] ? "border-red-500" : ""}`}
        value={(form as any)[field]}
        inputMode="decimal"
        maxLength={maxLen}
        onChange={e => {
          if (isSubmitted) return;
          const val = e.target.value.replace(/[^0-9.]/g, "");
          handleChange(field, val);
        }}
        readOnly={isSubmitted}
      />
      {errors[field] && <span className="text-red-500 text-xs mt-1">{errors[field]}</span>}
    </div>
  );

  const selectInput = (labelText: string, field: string, options: string[]) => (
    <div className="flex flex-col">
      {label(labelText)}
      <select
        className={`border p-2 rounded ${isSubmitted ? "bg-gray-100 cursor-not-allowed" : ""} ${errors[field] ? "border-red-500" : ""}`}
        value={(form as any)[field]}
        onChange={e => !isSubmitted && handleChange(field, e.target.value)}
        disabled={isSubmitted}
      >
        <option value="">เลือก{labelText}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {errors[field] && <span className="text-red-500 text-xs mt-1">{errors[field]}</span>}
    </div>
  );

  const fileRow = (labelText: string, file: File | null, setter: (f: File | null) => void, field: string) => (
    <div>
      <label className="block mb-1 text-sm text-gray-600">{labelText}</label>
      <div className={`flex items-center border rounded p-2 ${errors[field] ? "border-red-500" : ""}`}>
        <span className="flex-1 text-sm text-gray-600">
          {file ? file.name : "ยังไม่ได้เลือกไฟล์"}
        </span>
        {!isSubmitted && (
          <label className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded cursor-pointer text-sm">
            เลือกไฟล์
            <input
              type="file"
              className="hidden"
              onChange={e => handleFileChange(e.target.files?.[0] || null, setter)}
            />
          </label>
        )}
      </div>
      {errors[field] && <span className="text-red-500 text-xs mt-1">{errors[field]}</span>}
    </div>
  );


  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <h1 className="text-2xl font-bold mb-6">ติวเตอร์</h1>

      <div className="bg-white p-8 rounded-xl shadow-md w-full">

        <div className="flex items-center mb-4">
          <button onClick={() => router.push("/home/tutor")} className="text-blue-500 hover:underline mr-4">
            ← ย้อนกลับ
          </button>
        </div>

        {verifyStatus === "rejected" && (
          <p className="text-red-500 mb-4 font-medium">
            ❌ ไม่ผ่าน กรุณาแก้ไขข้อมูลแล้วส่งใหม่
          </p>
        )}

        <h2 className="text-xl font-semibold mb-4">ข้อมูลส่วนบุคคล</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col">
            {label("รหัสบัตรประชาชน")}
            <input
              placeholder="รหัสบัตรประชาชน"
              className={`border p-2 rounded ${isSubmitted ? "bg-gray-100 cursor-not-allowed" : ""} ${errors.idCardNumber ? "border-red-500" : ""}`}
              value={form.idCardNumber}
              inputMode="numeric"
              maxLength={13}
              onChange={e => {
                if (isSubmitted) return;
                handleChange("idCardNumber", e.target.value.replace(/\D/g, ""));
              }}
              readOnly={isSubmitted}
            />
            {errors.idCardNumber && <span className="text-red-500 text-xs mt-1">{errors.idCardNumber}</span>}
          </div>

          {lockedInput("อีเมล", "email")}
          {lockedInput("ชื่อ", "name")}
          {lockedInput("นามสกุล", "surname")}
          {freeInput("ชื่อ (English)", "firstNameEN")}
          {freeInput("นามสกุล (English)", "lastNameEN")}
          {lockedInput("เบอร์โทรศัพท์", "phone")}
          {freeInput("จังหวัดที่อาศัย", "province")}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {freeInput("เชื้อชาติ", "ethnicity")}
          {freeInput("สัญชาติ", "nationality")}
          {selectInput("ศาสนา", "religion", ["พุทธ", "คริสต์", "อิสลาม", "ฮินดู", "ซิกข์", "ไม่มีศาสนา", "อื่นๆ"])}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex flex-col">
            {label("วันเกิด")}
            <input
              type="text"
              placeholder="วันเกิด"
              className={`border p-2 rounded ${isSubmitted ? "bg-gray-100 cursor-not-allowed" : ""} ${errors.birthDate ? "border-red-500" : ""}`}
              value={form.birthDate}
              onChange={e => !isSubmitted && handleChange("birthDate", e.target.value)}
              onFocus={e => { if (!isSubmitted) e.target.type = "date"; }}
              onBlur={e => { if (!e.target.value) e.target.type = "text"; }}
              readOnly={isSubmitted}
            />
            {errors.birthDate && <span className="text-red-500 text-xs mt-1">{errors.birthDate}</span>}
          </div>

          {freeInput("ความถนัดทางวิชาการ", "academicStrength")}
        </div>

        <h2 className="text-xl font-semibold mb-4">ข้อมูลการศึกษา</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="flex flex-col">
            {label("ระดับการศึกษา")}
            <select
              className={`border p-2 rounded ${isSubmitted ? "bg-gray-100 cursor-not-allowed" : ""} ${errors.educationLevel ? "border-red-500" : ""}`}
              value={form.educationLevel}
              onChange={e => !isSubmitted && handleChange("educationLevel", e.target.value)}
              disabled={isSubmitted}
            >
              <option value="">เลือกระดับการศึกษา</option>
              <option value="ปริญญาตรี">ปริญญาตรี</option>
              <option value="ปริญญาโท">ปริญญาโท</option>
              <option value="ปริญญาเอก">ปริญญาเอก</option>
            </select>
            {errors.educationLevel && <span className="text-red-500 text-xs mt-1">{errors.educationLevel}</span>}
          </div>

          {freeInput("ชื่อสถาบันการศึกษา", "university")}
          {freeInput("คณะ", "faculty")}
          {freeInput("สาขาวิชา", "major")}
          {numericInput("เกรดเฉลี่ย (GPA)", "gpa", 4)}
          {numericInput("ประสบการณ์สอน (ปี)", "tutorExp", 2)}
        </div>

        <h2 className="text-xl font-semibold mb-4">แนบเอกสาร</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {fileRow("บัตรประชาชน", idCard, setIdCard, "idCard")}
          {fileRow("ประกาศนียบัตร/ปริญญาบัตร", certificate, setCertificate, "certificate")}
          {fileRow("Transcript", transcript, setTranscript, "transcript")}
          {fileRow("Resume", resume, setResume, "resume")}
        </div>

        {!isSubmitted && (
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded"
          >
            ส่งข้อมูล
          </button>
        )}

        {isSubmitted && verifyStatus !== "rejected" && (
          <div className={`text-sm font-medium px-4 py-2 rounded w-fit ${
            verifyStatus === "approved"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}>
            {verifyStatus === "approved" && "✅ แอดมินอนุมัติแล้ว"}
            {verifyStatus === "pending" && "⏳ ส่งข้อมูลแล้ว รอการยืนยันจากแอดมิน"}
          </div>
        )}

      </div>
    </div>
  );
}
