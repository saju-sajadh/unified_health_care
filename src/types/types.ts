import { Roles } from "./global";

export interface UserData {
  userId: string;
  email: string;
  createdAt: Date;
  role: Roles;
  hospitalData?: {
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
  };
  governmentData?: {
    organization?: string;
    region?: string;
  };
  adminData?: {
    department?: string;
  };
}

export interface PatientData {
  _id?: string;
  uhn: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
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
  hospitalId: string;
  medicalRecords?: any[];
}

export interface HospitalProfile {
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
  establishedDate?: string;
  isActive?: boolean;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  userId?: string;
  email?: string;
  role?: string;
}


export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface Contact {
  phone?: string;
  email?: string;
  website?: string;
}