"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { getHospitalProfile, getPatients } from "@/actions/actions";
import { HospitalProfile, PatientData } from "@/types/types";
import Link from "next/link";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import dayjs from "dayjs";

ChartJS.register(ArcElement, Tooltip, Legend, LineElement, PointElement, LinearScale, CategoryScale);

interface DashboardProps {
  setActive: React.Dispatch<React.SetStateAction<string>>;
}

const DashboardContent: React.FC<DashboardProps> = ({ setActive }) => {
  const { user } = useUser();
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          const profileResponse = await getHospitalProfile(user.id);
          if (profileResponse.success && profileResponse.data) {
            setProfile(profileResponse.data);
          } else {
            setError(profileResponse.error || "Failed to fetch hospital profile");
          }

          const patientsResponse = await getPatients(user.id);
          if (patientsResponse.success && patientsResponse.data) {
            setPatients(patientsResponse.data);
          } else {
            setError(patientsResponse.error || "Failed to fetch patients");
          }
        } catch (error) {
          setError("Error fetching dashboard data");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  // Prepare data for patient distribution chart (by gender)
  const genderCounts = patients.reduce((acc, patient) => {
    const gender = patient.gender || "";
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const doughnutData = {
    labels: Object.keys(genderCounts),
    datasets: [
      {
        data: Object.values(genderCounts),
        backgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF"],
        hoverBackgroundColor: ["#36A2EB", "#FF6384", "#FFCE56", "#4BC0C0", "#9966FF"],
      },
    ],
  };

  // Prepare data for patient trend chart (using createdAt)
  const today = dayjs();
  const MonthsAgo = today.subtract(5, "month");
  const months = Array.from({ length: 6 }, (_, i) =>
    MonthsAgo.add(i, "month").format("MMM")
  );

  const patientCountsByMonth = patients.reduce((acc, patient) => {
    if (patient.createdAt) {
      const month = dayjs(patient.createdAt).format("MMM");
      if (months.includes(month)) {
        acc[month] = (acc[month] || 0) + 1;
      }
    }
    return acc;
  }, {} as Record<string, number>);

  const patientTrendData = {
    labels: months,
    datasets: [
      {
        label: "New Patients",
        data: months.map((month) => patientCountsByMonth[month] || 0),
        fill: false,
        borderColor: "#36A2EB",
        tension: 0.4,
      },
    ],
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
          <h1 className="text-4xl font-bold mb-2">Welcome, {profile.name || ""}</h1>
          <p className="text-emerald-100 text-lg">Manage your hospital operations with ease</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto -mt-16">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <svg
                className="w-8 h-8 text-emerald-600 mr-4"
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
              <div>
                <p className="font-medium text-gray-600">Total Patients</p>
                <h3 className="text-2xl font-bold">{patients.length}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <svg
                className="w-8 h-8 text-emerald-600 mr-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v1m-7 0v-1m-3-2h10a3 3 0 003-3V7a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z"
                ></path>
              </svg>
              <div>
                <p className="font-medium text-gray-600">Departments</p>
                <h3 className="text-2xl font-bold">{profile.departments?.length || 0}</h3>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center">
              <svg
                className="w-8 h-8 text-emerald-600 mr-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <div>
                <p className="font-medium text-gray-600">License Number</p>
                <h3 className="text-2xl font-bold">{profile.licenseNumber}</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-emerald-600 mb-4">
              Patient Distribution by Gender
            </h4>
            <div className="h-64">
              <Doughnut
                data={doughnutData}
                options={{
                  maintainAspectRatio: false,
                  plugins: { legend: { position: "bottom" } },
                }}
              />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-emerald-600 mb-4">
              Patient Trend (Last 6 Months)
            </h4>
            <div className="h-64">
              <Line
                data={patientTrendData}
                options={{
                  maintainAspectRatio: false,
                  scales: { y: { beginAtZero: true } },
                }}
              />
            </div>
          </div>
        </div>

        {/* Recent Activity and Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="md:col-span-2 bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-emerald-600 mb-4">Recent Activity</h4>
            <ul className="space-y-4">
              {patients.slice(0, 5).map((patient, index) => (
                <li key={index} className="flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full mr-2 ${
                      index === 0 ? "bg-blue-500" : "bg-gray-400"
                    }`}
                  ></span>
                  <p className="text-gray-600">
                    {patient.firstName} {patient.lastName} registered (
                    {dayjs(patient.createdAt).format("MMMM D, YYYY")})
                  </p>
                </li>
              ))}
              {patients.length === 0 && (
                <li className="text-gray-600">No recent activity</li>
              )}
            </ul>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h4 className="text-lg font-semibold text-emerald-600 mb-4">Quick Actions</h4>
            <div className="space-y-4">
              <button
                onClick={() => setActive("Hospital Profile")}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
              >
                Edit Hospital Profile
              </button>
              <button
                onClick={() => setActive("Patients Registration")}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-colors duration-200"
              >
                Register New Patient
              </button>
            </div>
          </div>
        </div>
        {error && <p className="mt-4 text-sm text-red-500 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default DashboardContent;