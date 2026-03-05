import mongoose from "mongoose";

const VerificationDocumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  nationalId: String,

  firstNameTH: String,
  lastNameTH: String,

  firstNameEN: String,
  lastNameEN: String,

  birthDate: String,

  province: String,
  ethnicity: String,
  nationality: String,
  religion: String,

  height: Number,
  weight: Number,

  university: String,
  faculty: String,
  major: String,
  gpa: Number,

  idCardFile: String,
  certificateFile: String,
  transcriptFile: String,
  resumeFile: String,

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.VerificationDocument ||
  mongoose.model("VerificationDocument", VerificationDocumentSchema);