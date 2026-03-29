import mongoose, { Schema, Document } from "mongoose";

export interface IMessage {
  senderId: string;
  senderRole: "student" | "tutor" | "admin";
  text: string;
  createdAt: Date;
}

export interface ISupportTicket extends Document {
  userId: mongoose.Types.ObjectId;
  userRole: "student" | "tutor";
  subject: string;
  messages: IMessage[];
  status: "open" | "closed";
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  senderId: { type: String, required: true },
  senderRole: { type: String, enum: ["student", "tutor", "admin"], required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const SupportTicketSchema = new Schema<ISupportTicket>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userRole: { type: String, enum: ["student", "tutor"], required: true },
    subject: { type: String, required: true },
    messages: [MessageSchema],
    status: { type: String, enum: ["open", "closed"], default: "open" },
  },
  { timestamps: true }
);

export default mongoose.models.SupportTicket ||
  mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);