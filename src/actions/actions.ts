"use server";

import { connectDB } from "@/lib/connect";
import Hospital from "@/models/hospitalSchema";
import GovernmentUser from "@/models/governmentSchema";
import { AdminUser } from "@/models/adminSchema";
import Patient from "@/models/patientSchema";
import { Roles } from "@/types/global";
import { UserData, HospitalProfile, PatientData } from "@/types/types";

export async function createUser(userData: UserData) {
  try {
    await connectDB();

    if (!["hospital", "government", "admin"].includes(userData.role)) {
      return { success: false, error: "Invalid role specified" };
    }

    if (userData.role === "hospital") {
      const existingUser = await Hospital.findOne({ userId: userData.userId });
      if (!existingUser) {
        await Hospital.create({
          userId: userData.userId,
          email: userData.email,
          role: userData.role,
          createdAt: userData.createdAt,
          ...userData.hospitalData,
        });
      }
    } else if (userData.role === "government") {
      const existingUser = await GovernmentUser.findOne({
        userId: userData.userId,
      });
      if (!existingUser) {
        await GovernmentUser.create({
          userId: userData.userId,
          email: userData.email,
          role: userData.role,
          createdAt: userData.createdAt,
          ...userData.governmentData,
        });
      }
    } else if (userData.role === "admin") {
      const existingUser = await AdminUser.findOne({ userId: userData.userId });
      if (!existingUser) {
        await AdminUser.create({
          userId: userData.userId,
          email: userData.email,
          role: userData.role,
          createdAt: userData.createdAt,
          ...userData.adminData,
        });
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error creating user:", error);
    return { success: false, error: "Failed to create user" };
  }
}

export async function getUser(
  userId?: string,
  role?: Roles
): Promise<{ success: boolean; data?: UserData; error?: string }> {
  try {
    await connectDB();

    if (!["hospital", "government", "admin"].includes(role!)) {
      const result = { success: false, error: "Invalid role specified" };
      return JSON.parse(JSON.stringify(result));
    }

    let user: UserData | null = null;
    if (role === "hospital") {
      user = await Hospital.findOne({ userId }).lean<UserData>();
    } else if (role === "government") {
      user = await GovernmentUser.findOne({ userId }).lean<UserData>();
    } else if (role === "admin") {
      user = await AdminUser.findOne({ userId }).lean<UserData>();
    }

    if (!user) {
      const result = { success: false, error: "User not found" };
      return JSON.parse(JSON.stringify(result));
    }

    const result = { success: true, data: user };
    return JSON.parse(JSON.stringify(result));
  } catch (error) {
    console.error("Error retrieving user:", error);
    return { success: false, error: "Failed to retrieve user" };
  }
}

export async function getPatients(
  hospitalUserId: string
): Promise<{ success: boolean; data?: PatientData[]; error?: string }> {
  try {
    await connectDB();
    const hospital = await Hospital.findOne({ userId: hospitalUserId });
    if (!hospital) {
      return { success: false, error: "Hospital not found" };
    }
    const patients = await Patient.find({ hospitalId: hospital._id }).lean<
      PatientData[]
    >();
    return { success: true, data: patients };
  } catch (error) {
    console.error("Error retrieving patients:", error);
    return { success: false, error: "Failed to retrieve patients" };
  }
}

export async function registerPatient(formData: FormData) {
  try {
    await connectDB();

    const patientData: PatientData = {
      _id: formData.get("_id") as string | undefined,
      uhn: formData.get("uhn") as string,
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      dateOfBirth: formData.get("dateOfBirth")
        ? new Date(formData.get("dateOfBirth") as string).toISOString()
        : "",
      gender: formData.get("gender") as string,
      contact: {
        phone: formData.get("contact.phone") as string,
        email: formData.get("contact.email") as string,
      },
      address: {
        street: formData.get("address.street") as string,
        city: formData.get("address.city") as string,
        state: formData.get("address.state") as string,
        country: formData.get("address.country") as string,
        postalCode: formData.get("address.postalCode") as string,
      },
      hospitalId: formData.get("hospitalId") as string,
      medicalRecords: [],
    };

    if (
      !patientData.uhn ||
      !patientData.firstName ||
      !patientData.lastName ||
      !patientData.hospitalId
    ) {
      return {
        success: false,
        error: "UHN, first name, last name, and hospital ID are required",
      };
    }

    const hospital = await Hospital.findOne({ userId: patientData.hospitalId });
    if (!hospital) {
      return { success: false, error: "Invalid hospital ID" };
    }

    if (patientData._id) {
      const existingPatient = await Patient.findOne({
        uhn: patientData.uhn,
        _id: { $ne: patientData._id },
      });
      if (existingPatient) {
        return {
          success: false,
          error: "UHN is already in use by another patient",
        };
      }
      await Patient.findByIdAndUpdate(
        patientData._id,
        {
          ...patientData,
          hospitalId: hospital._id,
          medicalRecords: patientData.medicalRecords || [],
        },
        { new: true }
      );
    } else {
      const existingPatient = await Patient.findOne({ uhn: patientData.uhn });
      if (existingPatient) {
        return { success: false, error: "UHN is already in use" };
      }
      await Patient.create({
        ...patientData,
        hospitalId: hospital._id,
      });
    }

    return { success: true };
  } catch (error) {
    console.error("Error registering patient:", error);
    return { success: false, error: "Failed to register patient" };
  }
}

export async function checkUHN(
  uhn: string
): Promise<{ success: boolean; isUnique?: boolean; error?: string }> {
  try {
    await connectDB();
    const existingPatient = await Patient.findOne({ uhn });
    return { success: true, isUnique: !existingPatient };
  } catch (error) {
    console.error("Error checking UHN:", error);
    return { success: false, error: "Failed to check UHN" };
  }
}

export async function getHospitalProfile(
  userId: string
): Promise<{ success: boolean; data?: HospitalProfile; error?: string }> {
  try {
    await connectDB();
    const hospital = await Hospital.findOne({ userId }).lean<HospitalProfile>();
    if (!hospital) {
      return { success: false, error: "Hospital profile not found" };
    }
    return { success: true, data: hospital };
  } catch (error) {
    console.error("Error retrieving hospital profile:", error);
    return { success: false, error: "Failed to retrieve hospital profile" };
  }
}

export async function updateHospitalProfile(
  userId: string,
  profileData: Partial<HospitalProfile>
): Promise<{ success: boolean; data?: HospitalProfile; error?: string }> {
  try {
    await connectDB();

    const hospital = await Hospital.findOne({ userId });
    if (!hospital) {
      return { success: false, error: "Hospital profile not found" };
    }

    // Update only the provided fields
    const updatedFields: Partial<HospitalProfile> = {
      name: profileData.name ?? hospital.name,
      hospitalCode: profileData.hospitalCode ?? hospital.hospitalCode,
      contact: {
        email: profileData.contact?.email ?? hospital.contact?.email,
        phone: profileData.contact?.phone ?? hospital.contact?.phone,
        website: profileData.contact?.website ?? hospital.contact?.website,
      },
      address: {
        street: profileData.address?.street ?? hospital.address?.street,
        city: profileData.address?.city ?? hospital.address?.city,
        state: profileData.address?.state ?? hospital.address?.state,
        country: profileData.address?.country ?? hospital.address?.country,
        postalCode: profileData.address?.postalCode ?? hospital.address?.postalCode,
      },
      departments: profileData.departments ?? hospital.departments,
      licenseNumber: profileData.licenseNumber ?? hospital.licenseNumber,
      establishedDate: profileData.establishedDate ?? hospital.establishedDate,
    };

    const updatedHospital = await Hospital.findOneAndUpdate(
      { userId },
      { $set: updatedFields },
      { new: true }
    ).lean<HospitalProfile>();

    if (!updatedHospital) {
      return { success: false, error: "Failed to update hospital profile" };
    }

    return { success: true, data: updatedHospital };
  } catch (error) {
    console.error("Error updating hospital profile:", error);
    return { success: false, error: "Failed to update hospital profile" };
  }
}