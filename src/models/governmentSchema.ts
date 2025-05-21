import mongoose, { Schema, Document, model } from "mongoose";

// Interface for Government User
interface IGovernmentUser extends Document {
  email: string;
  role: "government";
  organization: string;
  region: string;
  createdAt: Date;
  updatedAt: Date;
}

// Government User Schema
const GovernmentUserSchema: Schema = new Schema(
  {
    email: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      default: "government",
    },
    organization: {
      type: String,

      trim: true,
    },
    region: {
      type: String,

      trim: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

// Create and export Mongoose model
const GovernmentUser =
  mongoose.models.GovernmentUser ||
  model<IGovernmentUser>("GovernmentUser", GovernmentUserSchema);

export default GovernmentUser;
