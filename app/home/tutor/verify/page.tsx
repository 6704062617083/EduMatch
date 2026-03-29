"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function TutorVerify() {

  const [form, setForm] = useState({
    email: "",
    name: "",
    surname: "",
    phone: "",
    idCardNumber: "",
    nickname: "",
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
  const [tutorPhoto, setTutorPhoto] = useState<File | null>(null);
  const [paymentQr, setPaymentQr] = useState<File | null>(null);

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
          nickname:         doc.nickname         || "",
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
      nickname:         "ชื่อเล่น",
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
    if (!tutorPhoto) newErrors.tutorPhoto = "กรุณาแนบรูปติวเตอร์";
    if (!paymentQr) newErrors.paymentQr = "กรุณาแนบ QR โค้ดรับเงิน";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    if (form.idCardNumber.length !== 13) { alert("กรุณากรอกเลขบัตร 13 หลัก"); return; }
    if (!isValidThaiID(form.idCardNumber)) { alert("เลขบัตรประชาชนไม่ถูกต้อง"); return; }
    try {
      const formData = new FormData();
      formData.append("nationalId",       form.idCardNumber);
      formData.append("nickname",         form.nickname);
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
      if (tutorPhoto)  formData.append("tutorPhoto",  tutorPhoto);
      if (paymentQr)   formData.append("paymentQr",   paymentQr);
      const res = await fetch("/api/tutor/verify", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) { alert(data.error || "เกิดข้อผิดพลาด"); return; }
      alert("ส่งข้อมูลสำเร็จ รอการยืนยันจากแอดมิน");
      router.push("/home/tutor/status");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาด");
    }
  };

  const inputBase = (hasError: boolean, locked: boolean) =>
    `w-full px-4 py-3 rounded-2xl border text-sm font-bold text-[#1e3a5f] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all
    ${hasError ? "border-red-300 bg-red-50" : "border-orange-100 bg-orange-50"}
    ${locked ? "cursor-not-allowed opacity-70" : ""}`;

  const label = (text: string) => (
    <label className="text-[10px] font-black text-gray-400 uppercase tracking-tighter px-1 mb-1">{text}</label>
  );

  const lockedInput = (labelText: string, field: string) => (
    <div className="flex flex-col gap-1">
      {label(labelText)}
      <input
        placeholder={labelText}
        className={inputBase(false, true)}
        value={(form as any)[field]}
        readOnly
      />
    </div>
  );

  const freeInput = (labelText: string, field: string, extra?: React.InputHTMLAttributes<HTMLInputElement>) => (
    <div className="flex flex-col gap-1">
      {label(labelText)}
      <input
        placeholder={labelText}
        className={inputBase(!!errors[field], isSubmitted)}
        value={(form as any)[field]}
        onChange={e => !isSubmitted && handleChange(field, e.target.value)}
        readOnly={isSubmitted}
        {...extra}
      />
      {errors[field] && <span className="text-red-400 text-[11px] font-bold px-1">{errors[field]}</span>}
    </div>
  );

  const numericInput = (labelText: string, field: string, maxLen: number) => (
    <div className="flex flex-col gap-1">
      {label(labelText)}
      <input
        placeholder={labelText}
        className={inputBase(!!errors[field], isSubmitted)}
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
      {errors[field] && <span className="text-red-400 text-[11px] font-bold px-1">{errors[field]}</span>}
    </div>
  );

  const selectInput = (labelText: string, field: string, options: string[]) => (
    <div className="flex flex-col gap-1">
      {label(labelText)}
      <select
        className={inputBase(!!errors[field], isSubmitted)}
        value={(form as any)[field]}
        onChange={e => !isSubmitted && handleChange(field, e.target.value)}
        disabled={isSubmitted}
      >
        <option value="">เลือก{labelText}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      {errors[field] && <span className="text-red-400 text-[11px] font-bold px-1">{errors[field]}</span>}
    </div>
  );

  const fileRow = (labelText: string, file: File | null, setter: (f: File | null) => void, field: string) => (
    <div className="flex flex-col gap-1">
      {label(labelText)}
      <div className={`flex items-center px-4 py-3 rounded-2xl border text-sm font-bold transition-all
        ${errors[field] ? "border-red-300 bg-red-50" : "border-orange-100 bg-orange-50"}`}>
        <span className="flex-1 text-gray-400 font-medium truncate">
          {file ? file.name : "ยังไม่ได้เลือกไฟล์"}
        </span>
        {!isSubmitted && (
          <label className="ml-3 px-4 py-1.5 rounded-xl bg-[#FC5404] hover:bg-orange-600 text-white text-[11px] font-black cursor-pointer transition-all active:scale-95 whitespace-nowrap">
            เลือกไฟล์
            <input
              type="file"
              className="hidden"
              onChange={e => handleFileChange(e.target.files?.[0] || null, setter)}
            />
          </label>
        )}
      </div>
      {errors[field] && <span className="text-red-400 text-[11px] font-bold px-1">{errors[field]}</span>}
    </div>
  );

  return (
    <div className="min-h-screen bg-orange-50 font-sans tracking-tight antialiased flex flex-col">
      <div className="flex items-center px-10 py-5 bg-[#FC5404] text-white shadow-md">
        <div className="flex items-center gap-4">
          <Link href="/home/tutor">
            <Image src="/Edu_icon.png" alt="Edumatch Logo" width={120} height={35} className="object-contain cursor-pointer" />
          </Link>
          <div className="h-6 w-[1px] bg-white/30 ml-2"></div>
          <span className="text-lg font-black tracking-tighter uppercase">ยืนยันตัวตน</span>
        </div>
      </div>

      <div className="p-8 max-w-[1400px] mx-auto w-full">
        <button
          onClick={() => router.push("/home/tutor")}
          className="mb-6 px-5 py-2.5 rounded-2xl bg-white border border-orange-100 text-[#FC5404] text-sm font-black shadow-sm hover:shadow-md hover:bg-orange-50 transition-all active:scale-95 flex items-center gap-2"
        >
          <span>‹</span> ย้อนกลับ
        </button>

        {verifyStatus === "rejected" && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-[24px] px-6 py-4">
            <p className="text-sm font-black text-red-600">ไม่ผ่านการยืนยัน — กรุณาแก้ไขข้อมูลแล้วส่งใหม่</p>
          </div>
        )}

        <div className="bg-white border border-orange-100 rounded-[32px] p-8 shadow-sm mb-6">
          <h2 className="text-2xl font-black text-[#1e3a5f] mb-6">ข้อมูลส่วนบุคคล</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col gap-1">
              {label("รหัสบัตรประชาชน")}
              <input
                placeholder="รหัสบัตรประชาชน 13 หลัก"
                className={inputBase(!!errors.idCardNumber, isSubmitted)}
                value={form.idCardNumber}
                inputMode="numeric"
                maxLength={13}
                onChange={e => {
                  if (isSubmitted) return;
                  handleChange("idCardNumber", e.target.value.replace(/\D/g, ""));
                }}
                readOnly={isSubmitted}
              />
              {errors.idCardNumber && <span className="text-red-400 text-[11px] font-bold px-1">{errors.idCardNumber}</span>}
            </div>
            {lockedInput("อีเมล", "email")}
            {lockedInput("ชื่อ", "name")}
            {lockedInput("นามสกุล", "surname")}
            {freeInput("ชื่อ (English)", "firstNameEN")}
            {freeInput("นามสกุล (English)", "lastNameEN")}
            {freeInput("ชื่อเล่น", "nickname")}
            {lockedInput("เบอร์โทรศัพท์", "phone")}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {freeInput("เชื้อชาติ", "ethnicity")}
            {freeInput("สัญชาติ", "nationality")}
            {selectInput("ศาสนา", "religion", ["พุทธ", "คริสต์", "อิสลาม", "ฮินดู", "ซิกข์", "ไม่มีศาสนา", "อื่นๆ"])}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1">
              {label("วันเกิด")}
              <input
                type="text"
                placeholder="วันเกิด"
                className={inputBase(!!errors.birthDate, isSubmitted)}
                value={form.birthDate}
                onChange={e => !isSubmitted && handleChange("birthDate", e.target.value)}
                onFocus={e => { if (!isSubmitted) e.target.type = "date"; }}
                onBlur={e => { if (!e.target.value) e.target.type = "text"; }}
                readOnly={isSubmitted}
              />
              {errors.birthDate && <span className="text-red-400 text-[11px] font-bold px-1">{errors.birthDate}</span>}
            </div>
            {freeInput("ความถนัดทางวิชาการ", "academicStrength")}
            {freeInput("จังหวัดที่อาศัย", "province")}
          </div>
        </div>

        <div className="bg-white border border-orange-100 rounded-[32px] p-8 shadow-sm mb-6">
          <h2 className="text-2xl font-black text-[#1e3a5f] mb-6">ข้อมูลการศึกษา</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              {label("ระดับการศึกษา")}
              <select
                className={inputBase(!!errors.educationLevel, isSubmitted)}
                value={form.educationLevel}
                onChange={e => !isSubmitted && handleChange("educationLevel", e.target.value)}
                disabled={isSubmitted}
              >
                <option value="">เลือกระดับการศึกษา</option>
                <option value="ปริญญาตรี">ปริญญาตรี</option>
                <option value="ปริญญาโท">ปริญญาโท</option>
                <option value="ปริญญาเอก">ปริญญาเอก</option>
              </select>
              {errors.educationLevel && <span className="text-red-400 text-[11px] font-bold px-1">{errors.educationLevel}</span>}
            </div>
            {freeInput("ชื่อสถาบันการศึกษา", "university")}
            {freeInput("คณะ", "faculty")}
            {freeInput("สาขาวิชา", "major")}
            {numericInput("เกรดเฉลี่ย (GPA)", "gpa", 4)}
            {numericInput("ประสบการณ์สอน (ปี)", "tutorExp", 2)}
          </div>
        </div>

        <div className="bg-white border border-orange-100 rounded-[32px] p-8 shadow-sm mb-6">
          <h2 className="text-2xl font-black text-[#1e3a5f] mb-6">แนบเอกสาร</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fileRow("บัตรประชาชน", idCard, setIdCard, "idCard")}
            {fileRow("ประกาศนียบัตร/ปริญญาบัตร", certificate, setCertificate, "certificate")}
            {fileRow("Transcript", transcript, setTranscript, "transcript")}
            {fileRow("Resume", resume, setResume, "resume")}
            {fileRow("รูปติวเตอร์", tutorPhoto, setTutorPhoto, "tutorPhoto")}
            {fileRow("QR โค้ดรับเงิน", paymentQr, setPaymentQr, "paymentQr")}
          </div>
        </div>

        {!isSubmitted && (
          <button
            onClick={handleSubmit}
            className="px-8 py-3.5 rounded-2xl bg-[#FC5404] hover:bg-orange-600 text-white font-black shadow-lg shadow-orange-100 transition-all active:scale-95"
          >
            ส่งข้อมูล
          </button>
        )}

        {isSubmitted && verifyStatus !== "rejected" && (
          <div className={`px-6 py-4 rounded-[24px] border w-fit text-sm font-black ${
            verifyStatus === "approved"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-yellow-50 border-yellow-200 text-yellow-700"
          }`}>
            {verifyStatus === "approved" && "✅ แอดมินอนุมัติแล้ว"}
            {verifyStatus === "pending" && "⏳ ส่งข้อมูลแล้ว รอการยืนยันจากแอดมิน"}
          </div>
        )}
      </div>
    </div>
  );
}