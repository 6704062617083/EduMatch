import mongoose, { Schema, model, models } from "mongoose";

const TutorSchema = new Schema({
  userId:       { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  avgRating:    { type: Number, default: 0 },
  totalReviews: { type: Number, default: 0 },
});

export default models.Tutor || model("Tutor", TutorSchema);