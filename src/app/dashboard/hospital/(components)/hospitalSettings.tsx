"use client";

import React, { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getHospitalProfile } from "@/actions/actions";
import { HospitalProfile } from "@/types/types";
import Link from "next/link";

interface SettingsProps {
  setActive: React.Dispatch<React.SetStateAction<string>>;
}

const SettingsContent: React.FC<SettingsProps> = ({ setActive }) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true);
        try {
          const response = await getHospitalProfile(user.id);
          if (response.success && response.data) {
            setProfile(response.data);
          } else {
            setError(response.error || "Failed to fetch hospital profile");
          }
        } catch (error) {
          setError("Error fetching hospital profile");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
    } catch (error) {
      setError("Error signing out");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <svg
          className="animate-spin h-8 w-8 text-emerald-600"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
          ></path>
        </svg>
      </div>
    );
  }

  if (!profile || error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900">No Profile Found</h3>
        <p className="mt-2 text-gray-600">
          {error || "Please ensure you are logged in and have a hospital profile."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* Hero Section */}
      <div className="bg-emerald-600 text-white py-20 px-6 rounded-lg mb-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-2">
            Settings for {profile.name || "Hospital Admin"}
          </h1>
          <p className="text-emerald-100 text-lg">
            View your hospital profile details
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto -mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hospital Details */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h4 className="text-lg font-semibold text-emerald-600 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h-2m-6 0H7m2-4h6m-2 2h2"
                ></path>
              </svg>
              Hospital Details
            </h4>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Name:</span> {profile.name}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Hospital Code:</span> {profile.hospitalCode}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">License Number:</span> {profile.licenseNumber}
              </p>
              {profile.establishedDate && (
                <p className="text-gray-600">
                  <span className="font-medium">Established:</span>{" "}
                  {new Date(profile.establishedDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Address Details */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h4 className="text-lg font-semibold text-emerald-600 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                ></path>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                ></path>
              </svg>
              Address
            </h4>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Street:</span> {profile.address?.street}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">City:</span> {profile.address?.city}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">State:</span> {profile.address?.state}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Country:</span> {profile.address?.country}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Postal Code:</span> {profile.address?.postalCode}
              </p>
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <h4 className="text-lg font-semibold text-emerald-600 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                ></path>
              </svg>
              Contact Information
            </h4>
            <div className="space-y-2">
              <p className="text-gray-600">
                <span className="font-medium">Phone:</span> {profile.contact?.phone}
              </p>
              <p className="text-gray-600">
                <span className="font-medium">Email:</span> {profile.contact?.email}
              </p>
              {profile.contact?.website && (
                <p className="text-gray-600">
                  <span className="font-medium">Website:</span>{" "}
                  <a
                    href={profile.contact?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {profile.contact?.website}
                  </a>
                </p>
              )}
            </div>
          </div>

          {/* Departments */}
          {profile.departments && profile.departments.length > 0 && (
            <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
              <h4 className="text-lg font-semibold text-emerald-600 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h-2m-6 0H7m2-4h6m-2 2h2"
                    ></path>
                  </svg>
                  Departments
                </h4>
                <div className="space-y-2">
                  <p className="text-gray-600">{profile.departments.join(", ")}</p>
                </div>
              </div>
          )}

          {/* Account Management */}
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow col-span-1 md:col-span-2">
            <h4 className="text-lg font-semibold text-emerald-600 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
              Account Management
            </h4>
            <div className="space-y-4">
              <button
                onClick={() => setActive("Hospital Profile")}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
              >
                Edit Profile
              </button>
              <hr className="border-gray-200" />
              <button
                onClick={handleSignOut}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
        {error && (
          <p className="mt-4 text-sm text-red-500 text-center">{error}</p>
        )}
      </div>
    </div>
  );
};

export default SettingsContent;