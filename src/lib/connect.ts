import mongoose from "mongoose";

export async function connectDB(): Promise<mongoose.Connection> {
  const MONGODB_URI = process.env.MONGO_URI;

  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in environment variables");
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("MongoDB Atlas connected successfully");
    return mongoose.connection;
  } catch (error) {
    throw new Error(`MongoDB connection failed: ${error}`);
  }
}
