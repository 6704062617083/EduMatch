import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: String,

    startTime: Date,

    endTime: Date,

    classLink: String,

    tutorId: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0
    },

    tags: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.Course ||
  mongoose.model("Course", CourseSchema);