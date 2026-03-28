import mongoose, { Schema, model, models } from "mongoose";

const ReviewSchema = new Schema({
  bookingId:  { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
  tutorId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
  studentId:  { type: Schema.Types.ObjectId, ref: "User", required: true },
  rating:     { type: Number, min: 1, max: 5, required: true },
  comment:    { type: String, default: "" },
  createdAt:  { type: Date, default: Date.now },
});

export default models.Review || model("Review", ReviewSchema);