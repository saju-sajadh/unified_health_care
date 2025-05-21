"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  Spin,
  message,
  Typography,
  Button,
  Timeline,
  Badge,
  Row,
  Col,
} from "antd";
import {
  UserOutlined,
  TeamOutlined,
  FileTextOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { getHospitalProfile, getPatients } from "@/actions/actions";
import { HospitalProfile, PatientData } from "@/types/types";
import { Doughnut, Line } from "react-chartjs-2";
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
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
);

const { Title, Text } = Typography;

interface DashboardProps {
  setActive: React.Dispatch<React.SetStateAction<string>>;
}

const DashboardContent = (props: DashboardProps) => {
  const { user } = useUser();
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        setLoading(true);
        try {
          const profileResponse = await getHospitalProfile(user.id);
          if (profileResponse.success && profileResponse.data) {
            setProfile(profileResponse.data);
          } else {
            message.error(
              profileResponse.error || "Failed to fetch hospital profile"
            );
          }

          const patientsResponse = await getPatients(user.id);
          if (patientsResponse.success && patientsResponse.data) {
            setPatients(patientsResponse.data);
          } else {
            message.error(patientsResponse.error || "Failed to fetch patients");
          }
        } catch (error) {
          message.error("Error fetching dashboard data");
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  // Prepare data for patient distribution chart (by gender)
  const genderCounts = patients.reduce((acc, patient) => {
    const gender = patient.gender || "Unknown";
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const doughnutData = {
    labels: Object.keys(genderCounts),
    datasets: [
      {
        data: Object.values(genderCounts),
        backgroundColor: [
          "#36A2EB",
          "#FF6384",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
        hoverBackgroundColor: [
          "#36A2EB",
          "#FF6384",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
        ],
      },
    ],
  };

  // Prepare data for patient trend chart (mock data)
  const patientTrendData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "New Patients",
        data: [10, 20, 15, 30, 25, patients.length], // Mock data + current patient count
        fill: false,
        borderColor: "#36A2EB",
        tension: 0.4,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <Title level={3}>No Profile Found</Title>
        <Text>
          Please ensure you are logged in and have a hospital profile.
        </Text>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Hero Section */}
      <div className="bg-emerald-600 text-white py-20 px-6 rounded-lg mb-6">
        <div className="max-w-4xl mx-auto text-center">
          <Title level={1} className="!text-white mb-2">
            Welcome, {profile.name || ""}
          </Title>
          <Text className="text-emerald-100 text-lg">
            Manage your hospital operations with ease
          </Text>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto -mt-16">
        {/* Metrics Cards */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={8}>
            <Card className="shadow-lg rounded-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <UserOutlined className="text-3xl text-emerald-600 mr-4" />
                <div>
                  <Text strong>Total Patients</Text>
                  <Title level={3} className="mt-0">
                    {patients.length}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="shadow-lg rounded-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <TeamOutlined className="text-3xl text-emerald-600 mr-4" />
                <div>
                  <Text strong>Departments</Text>
                  <Title level={3} className="mt-0">
                    {profile.departments?.length || 0}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card className="shadow-lg rounded-lg hover:shadow-xl transition-shadow">
              <div className="flex items-center">
                <FileTextOutlined className="text-3xl text-emerald-600 mr-4" />
                <div>
                  <Text strong>License Number</Text>
                  <Title level={3} className="mt-0">
                    {profile.licenseNumber}
                  </Title>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Charts and Timeline */}
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card className="shadow-lg rounded-lg">
              <Title level={4} className="mb-4">
                Patient Distribution by Gender
              </Title>
              <div className="h-64">
                <Doughnut
                  data={doughnutData}
                  options={{
                    maintainAspectRatio: false,
                    plugins: { legend: { position: "bottom" } },
                  }}
                />
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card className="shadow-lg rounded-lg">
              <Title level={4} className="mb-4">
                Patient Trend (Last 6 Months)
              </Title>
              <div className="h-64">
                <Line
                  data={patientTrendData}
                  options={{
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: true } },
                  }}
                />
              </div>
            </Card>
          </Col>
        </Row>

        {/* Recent Activity and Quick Actions */}
        <Row gutter={[16, 16]} className="mt-6">
          <Col xs={24} md={16}>
            <Card className="shadow-lg rounded-lg">
              <Title level={4} className="mb-4">
                Recent Activity
              </Title>
              <Timeline>
                {patients.slice(0, 5).map((patient, index) => (
                  <Timeline.Item
                    key={index}
                    dot={
                      <Badge status={index === 0 ? "processing" : "default"} />
                    }
                  >
                    <Text>
                      {patient.firstName} {patient.lastName} registered (Today)
                    </Text>
                  </Timeline.Item>
                ))}
                {patients.length === 0 && (
                  <Timeline.Item>
                    <Text>No recent activity</Text>
                  </Timeline.Item>
                )}
              </Timeline>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="shadow-lg rounded-lg">
              <Title level={4} className="mb-4">
                Quick Actions
              </Title>
              <div className="space-y-4">
                <Button
                  type="primary"
                  icon={<EditOutlined />}
                  block
                  onClick={() => {
                    props.setActive("Hospital Profile");
                  }}
                >
                  Edit Hospital Profile
                </Button>
                <Button
                  type="default"
                  icon={<PlusOutlined />}
                  block
                  onClick={() => {
                    props.setActive("Patients Registration");
                  }}
                >
                  Register New Patient
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DashboardContent;
