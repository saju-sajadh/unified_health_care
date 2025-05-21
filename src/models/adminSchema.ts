import mongoose, { Schema, Document, model } from "mongoose";

// Interface for Admin User
interface IAdminUser extends Document {
  email: string;
  role: "admin";
  department: string;
  createdAt: Date;
  updatedAt: Date;
}

// Admin User Schema
const AdminUserSchema: Schema = new Schema(
  {
    email: {
      type: String,

      trim: true,
    },
    role: {
      type: String,

      default: "admin",
    },
    department: {
      type: String,

      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create and export Mongoose model
export const AdminUser =
  mongoose.models.AdminUser || model<IAdminUser>("AdminUser", AdminUserSchema);
