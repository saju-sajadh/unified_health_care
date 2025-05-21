import mongoose, { Schema, Document } from "mongoose";

interface IHospital extends Document {
  name?: string;
  hospitalCode?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  departments?: string[];
  licenseNumber?: string;
  establishedDate?: Date;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  userId?: string;
  email?: string;
  role?: string;
}

const hospitalSchema: Schema = new Schema<IHospital>(
  {
    name: {
      type: String,
      trim: true,
      minlength: [3, "Hospital name must be at least 3 characters"],
      maxlength: [100, "Hospital name cannot exceed 100 characters"],
    },
    hospitalCode: {
      type: String,
      unique: true,
      trim: true,
      match: [
        /^[A-Z0-9]{4,10}$/,
        "Hospital code must be 4-10 alphanumeric characters",
      ],
    },
    address: {
      street: {
        type: String,
        trim: true,
      },
      city: {
        type: String,
        trim: true,
      },
      state: {
        type: String,
        trim: true,
      },
      country: {
        type: String,
        trim: true,
      },
      postalCode: {
        type: String,
        trim: true,
      },
    },
    contact: {
      phone: {
        type: String,
        trim: true,
        match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"],
      },
      email: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
      },
      website: {
        type: String,
        trim: true,
        match: [/^https?:\/\/\S+$/, "Invalid website URL"],
      },
    },
    departments: [
      {
        type: String,
        trim: true,
      },
    ],
    licenseNumber: {
      type: String,
      unique: true,
      trim: true,
    },
    establishedDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
    userId: {
      type: String,
      unique: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email format"],
    },
    role: {
      type: String,
      enum: ["admin", "hospital", "government"],
    },
  },
  {
    timestamps: true,
  }
);

const Hospital =
  mongoose.models.Hospital ||
  mongoose.model<IHospital>("Hospital", hospitalSchema);

export default Hospital;
