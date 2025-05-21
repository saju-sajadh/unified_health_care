import mongoose, { Schema, Document } from "mongoose";

interface IPatient extends Document {
  uhn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: string;
  contact: {
    phone: string;
    email: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };
  hospitalId: mongoose.Types.ObjectId;
  medicalRecords: {
    recordId: mongoose.Types.ObjectId;
    date: Date;
    diagnosis: string;
    treatment: string;
    notes: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema: Schema = new Schema<IPatient>(
  {
    uhn: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      trim: true,
    },
    contact: {
      phone: {
        type: String,
        trim: true,
      },
      email: {
        type: String,
        trim: true,
      },
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
    hospitalId: {
      type: Schema.Types.ObjectId,
      ref: "Hospital",
    },
    medicalRecords: [
      {
        recordId: {
          type: Schema.Types.ObjectId,
        },
        date: {
          type: Date,
        },
        diagnosis: {
          type: String,
          trim: true,
        },
        treatment: {
          type: String,
          trim: true,
        },
        notes: {
          type: String,
          trim: true,
        },
      },
    ],
    createdAt: {
      type: Date,
    },
    updatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const Patient =
  mongoose.models.Patient ||
  mongoose.model<IPatient>("Patient", patientSchema);

export default Patient;