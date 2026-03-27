import mongoose from "mongoose";

const TutorWalletSchema = new mongoose.Schema({
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },

  accountName: String,
  accountNumber: String,
  bankName: String,      
  promptpayNumber: String,

  totalEarned: {
    type: Number,
    default: 0
  },

  totalCourses: {
    type: Number,
    default: 0
  }
});

export default mongoose.models.TutorWallet ||
  mongoose.model("TutorWallet", TutorWalletSchema);