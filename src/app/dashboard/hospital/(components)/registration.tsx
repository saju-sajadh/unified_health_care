"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Select, DatePicker, message } from "antd";
import { UserAddOutlined, IdcardOutlined } from "@ant-design/icons";
import { Dayjs } from "dayjs";
import { useUser } from "@clerk/nextjs";
import { registerPatient, checkUHN } from "@/actions/actions";
import dayjs from "dayjs";

const { Option } = Select;

interface PatientForm {
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
}

const PatientsRegistrationContent = () => {
  const router = useRouter();
  const { user } = useUser();
  const [formData, setFormData] = useState<PatientForm>({
    uhn: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    contact: { phone: "", email: "" },
    address: { street: "", city: "", state: "", country: "", postalCode: "" },
    hospitalId: user?.id || "",
  });
  const [errors, setErrors] = useState<{
    uhn?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    contact?: {
      phone?: string;
      email?: string;
    };
    address?: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
  }>({});
  const [loading, setLoading] = useState(false);
  const [uhnLoading, setUhnLoading] = useState(false);

  const emailRegex = /^\S+@\S+\.\S+$/;
  const phoneRegex = /^[1-9]\d{9}$/;
  const uhnRegex = /^UHN[A-Z0-9]{6}$/;

  const generateUHN = async () => {
    setUhnLoading(true);
    try {
      const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
      const generateRandomString = (length: number) => {
        let result = "";
        for (let i = 0; i < length; i++) {
          const randomIndex = Math.floor(Math.random() * charset.length);
          result += charset[randomIndex];
        }
        return result;
      };

      let uhn: string;
      let isUnique = false;
      const maxAttempts = 5;

      for (let i = 0; i < maxAttempts; i++) {
        uhn = "UHN" + generateRandomString(6); // Generates a 6-character alphanumeric code
        const result = await checkUHN(uhn);
        if (result.success && result.isUnique) {
          isUnique = true;
          setFormData({ ...formData, uhn });
          setErrors({ ...errors, uhn: undefined });
          message.success("UHN generated successfully!");
          break;
        }
      }

      if (!isUnique) {
        message.error("Failed to generate a unique UHN. Please try again.");
      }
    } catch (error) {
      message.error("Error generating UHN. Please try again.");
    } finally {
      setUhnLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: {
      uhn?: string;
      firstName?: string;
      lastName?: string;
      dateOfBirth?: string;
      gender?: string;
      contact?: {
        phone?: string;
        email?: string;
      };
      address?: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
      };
    } = {};

    if (!formData.uhn) {
      newErrors.uhn = "Unique Health Number is required";
    } else if (!uhnRegex.test(formData.uhn)) {
      newErrors.uhn =
        "UHN must be in format UHNXXXXXXX (9 alphanumeric characters)";
    }
    if (!formData.firstName) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }
    if (!formData.gender) {
      newErrors.gender = "Gender is required";
    }
    if (!formData.contact.phone) {
      newErrors.contact = {
        ...newErrors.contact,
        phone: "Phone number is required",
      };
    } else if (!phoneRegex.test(formData.contact.phone)) {
      newErrors.contact = {
        ...newErrors.contact,
        phone: "Invalid phone number format",
      };
    }
    if (!formData.contact.email) {
      newErrors.contact = { ...newErrors.contact, email: "Email is required" };
    } else if (!emailRegex.test(formData.contact.email)) {
      newErrors.contact = {
        ...newErrors.contact,
        email: "Invalid email format",
      };
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0 && !newErrors.contact;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: keyof PatientForm,
    nestedField?: keyof PatientForm["contact"] | keyof PatientForm["address"]
  ) => {
    if (nestedField && (field === "contact" || field === "address")) {
      setFormData({
        ...formData,
        [field]: {
          ...formData[field],
          [nestedField]: e.target.value,
        },
      });
    } else if (!nestedField) {
      setFormData({ ...formData, [field]: e.target.value });
    }
    // Clear error for the field being updated
    if (nestedField && field === "contact") {
      setErrors({
        ...errors,
        contact: { ...errors.contact, [nestedField]: undefined },
      });
    } else if (nestedField && field === "address") {
      setErrors({
        ...errors,
        address: { ...errors.address, [nestedField]: undefined },
      });
    } else if (!nestedField) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleDateChange = (
    date: Dayjs | null,
    dateString: string | string[]
  ) => {
    const value = Array.isArray(dateString) ? dateString[0] : dateString;
    setFormData({ ...formData, dateOfBirth: value });
    setErrors({ ...errors, dateOfBirth: undefined });
  };

  const handleGenderChange = (value: string) => {
    setFormData({ ...formData, gender: value });
    setErrors({ ...errors, gender: undefined });
  };

  const disabledDate = (current: Dayjs) => {
    return current && current > dayjs().endOf("day");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      message.error("Please fix the form errors before submitting.");
      return;
    }
    setLoading(true);
    try {
      if (user) {
        const data = new FormData();
        data.append("uhn", formData.uhn);
        data.append("firstName", formData.firstName);
        data.append("lastName", formData.lastName);
        data.append("dateOfBirth", formData.dateOfBirth);
        data.append("gender", formData.gender);
        data.append("contact.phone", formData.contact.phone);
        data.append("contact.email", formData.contact.email);
        data.append("address.street", formData.address.street);
        data.append("address.city", formData.address.city);
        data.append("address.state", formData.address.state);
        data.append("address.country", formData.address.country);
        data.append("address.postalCode", formData.address.postalCode);
        data.append("hospitalId", formData.hospitalId);

        const response = await registerPatient(data);
        if (response.success) {
          message.success("Patient registered successfully!");
          setFormData({
            uhn: "",
            firstName: "",
            lastName: "",
            dateOfBirth: "",
            gender: "",
            contact: { phone: "", email: "" },
            address: {
              street: "",
              city: "",
              state: "",
              country: "",
              postalCode: "",
            },
            hospitalId: user?.id || "",
          });
          setErrors({});
        } else {
          message.error(response.error || "Failed to register patient.");
        }
      }
    } catch (error) {
      message.error("Failed to register patient. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-1 lg:p-6 bg-white rounded-lg shadow-lg mt-4 lg:mt-20">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <UserAddOutlined className="mr-2 text-emerald-600" />
        Register New Patient
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unique Health Number (UHN)
            </label>
            <Input
              value={formData.uhn}
              onChange={(e) => handleInputChange(e, "uhn")}
              placeholder="Enter UHN (e.g., UHN1234567)"
              className="w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              status={errors.uhn ? "error" : undefined}
            />
            {errors.uhn && (
              <p className="text-red-500 text-xs mt-1">{errors.uhn}</p>
            )}
          </div>
          <Button
            onClick={generateUHN}
            loading={uhnLoading}
            className="bg-emerald-600 hover:bg-emerald-700 border-none text-white font-semibold py-2 px-4 rounded-md"
            icon={<IdcardOutlined />}
          >
            Generate UHN
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <Input
              value={formData.firstName}
              onChange={(e) => handleInputChange(e, "firstName")}
              placeholder="Enter first name"
              className="w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              status={errors.firstName ? "error" : undefined}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <Input
              value={formData.lastName}
              onChange={(e) => handleInputChange(e, "lastName")}
              placeholder="Enter last name"
              className="w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              status={errors.lastName ? "error" : undefined}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <DatePicker
              onChange={handleDateChange}
              className="w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              format="YYYY-MM-DD"
              disabledDate={disabledDate}
              status={errors.dateOfBirth ? "error" : undefined}
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <Select
              value={formData.gender || undefined}
              onChange={handleGenderChange}
              placeholder="Select gender"
              className="w-full"
              status={errors.gender ? "error" : undefined}
            >
              <Option value="Male">Male</Option>
              <Option value="Female">Female</Option>
              <Option value="Other">Other</Option>
            </Select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <Input
              value={formData.contact.phone}
              onChange={(e) => handleInputChange(e, "contact", "phone")}
              placeholder="Enter phone number"
              className="w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              status={errors.contact?.phone ? "error" : undefined}
            />
            {errors.contact?.phone && (
              <p className="text-red-500 text-xs mt-1">
                {errors.contact.phone}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <Input
              value={formData.contact.email}
              onChange={(e) => handleInputChange(e, "contact", "email")}
              placeholder="Enter email"
              className="w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              status={errors.contact?.email ? "error" : undefined}
            />
            {errors.contact?.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.contact.email}
              </p>
            )}
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Address</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street
            </label>
            <Input
              value={formData.address.street}
              onChange={(e) => handleInputChange(e, "address", "street")}
              placeholder="Enter street"
              className="w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <Input
                value={formData.address.city}
                onChange={(e) => handleInputChange(e, "address", "city")}
                placeholder="Enter city"
                className="w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <Input
                value={formData.address.state}
                onChange={(e) => handleInputChange(e, "address", "state")}
                placeholder="Enter state"
                className="w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <Input
                value={formData.address.country}
                onChange={(e) => handleInputChange(e, "address", "country")}
                placeholder="Enter country"
                className="w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code
              </label>
              <Input
                value={formData.address.postalCode}
                onChange={(e) => handleInputChange(e, "address", "postalCode")}
                placeholder="Enter postal code"
                className="w-full rounded-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
        <div>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            disabled={
              !!errors.contact?.phone || !!errors.contact?.email || !!errors.uhn
            }
            className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 border-none text-white font-semibold py-2 px-4 rounded-md disabled:bg-gray-400"
          >
            Register Patient
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PatientsRegistrationContent;
