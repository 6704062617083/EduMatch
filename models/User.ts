import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["student", "tutor", "admin"],
    required: true
  }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", UserSchema);