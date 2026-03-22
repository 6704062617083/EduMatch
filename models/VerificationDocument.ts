import mongoose from "mongoose";

const VerificationDocumentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    // ── ข้อมูลส่วนบุคคล ─────────────────────────────────────────
    nationalId:       String,
    firstNameEN:      String,
    lastNameEN:       String,
    province:         String,
    ethnicity:        String,
    nationality:      String,
    religion:         String,
    birthDate:        Date,
    height:           Number,
    weight:           Number,
    bloodType:        String,
    maritalStatus:    String,
    academicStrength: String,

    // ── การศึกษา ─────────────────────────────────────────────────
    educationLevel: {
      type: String,
      enum: ["ปริญญาตรี", "ปริญญาโท", "ปริญญาเอก", ""],
    },
    university: String,
    faculty:    String,
    major:      String,
    gpa:        Number,
    tutorExp:   Number,

    // ── ไฟล์ ─────────────────────────────────────────────────────
    idCardUrl:      String,
    certificateUrl: String,
    transcriptUrl:  String,
    resumeUrl:      String,

    // ── status ───────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectReason: String,
    verifiedAt:   Date,
  },
  { timestamps: true }
);

export default mongoose.models.VerificationDocument ||
  mongoose.model("VerificationDocument", VerificationDocumentSchema);