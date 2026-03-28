import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
    unique: true
  },

  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
    unique: true
  },

  amount: {
    type: Number,
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "waiting_payment", "slip_uploaded", "paid", "reject", "transferred_to_tutor"],
    default: "pending"
  },

  slipUrl: {
    type: String
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);