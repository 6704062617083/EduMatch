import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    console.log("Connecting to MongoDB...");
    cached.promise = mongoose.connect(MONGODB_URI)
      .then((mongoose) => {
        console.log("MongoDB Connected ✅");
        return mongoose;
      })
      .catch((err) => {
        console.error("MongoDB Connection Error ❌", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}