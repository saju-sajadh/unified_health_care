"use client";

import React, { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/nextjs";
import { Card, Spin, message, Typography, Button, Switch, Row, Col, Divider } from "antd";
import { EyeOutlined, DownloadOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { getHospitalProfile } from "@/actions/actions";
import { HospitalProfile } from "@/types/types";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

interface SettingsProps{
    setActive: React.Dispatch<React.SetStateAction<string>>;
}

const SettingsContent = (props: SettingsProps) => {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isProfilePublic, setIsProfilePublic] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true);
        try {
          const response = await getHospitalProfile(user.id);
          if (response.success && response.data) {
            setProfile(response.data);
            // Simulate fetching profile visibility (replace with actual API call if available)
            setIsProfilePublic(response.data.isActive || false);
          } else {
            message.error(response.error || "Failed to fetch hospital profile");
          }
        } catch (error) {
          message.error("Error fetching hospital profile");
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
      message.success("Signed out successfully");
      router.push("/"); // Adjust route as needed
    } catch (error) {
      message.error("Error signing out");
    }
  };

  const handleProfileVisibilityChange = (checked: boolean) => {
    setIsProfilePublic(checked);
    message.success(`Profile visibility set to ${checked ? "public" : "private"}`);
    // TODO: Add API call to save visibility preference to backend
  };

  const handleExportData = () => {
    // Simulate data export (replace with actual backend logic)
    message.success("Patient data export initiated. Check your email for the CSV file.");
    // Example: Call a server action to generate and send CSV
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
        <Text>Please ensure you are logged in and have a hospital profile.</Text>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen p-6">
      {/* Hero Section */}
      <div className="bg-emerald-600 text-white py-20 px-6 rounded-lg mb-6">
        <div className="max-w-4xl mx-auto text-center">
          <Title level={1} className="!text-white mb-2">
            Settings for {profile.name || "Hospital Admin"}
          </Title>
          <Text className="text-emerald-100 text-lg">
            Manage your hospital account settings
          </Text>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto -mt-12">
        <Row gutter={[16, 16]}>
          {/* Profile Visibility */}
          <Col xs={24} md={12}>
            <Card className="shadow-lg rounded-lg hover:shadow-xl transition-shadow">
              <Title level={4} className="mb-4 flex items-center">
                <EyeOutlined className="mr-2 text-emerald-600" />
                Profile Visibility
              </Title>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Text>Make Profile Public</Text>
                  <Switch
                    checked={isProfilePublic}
                    onChange={handleProfileVisibilityChange}
                  />
                </div>
                <Text type="secondary">
                  {isProfilePublic
                    ? "Your hospital profile is visible to other users and patients."
                    : "Your hospital profile is private and only visible to you."}
                </Text>
              </div>
            </Card>
          </Col>

          {/* Data Export */}
          <Col xs={24} md={12}>
            <Card className="shadow-lg rounded-lg hover:shadow-xl transition-shadow">
              <Title level={4} className="mb-4 flex items-center">
                <DownloadOutlined className="mr-2 text-emerald-600" />
                Data Export
              </Title>
              <div className="space-y-4">
                <Text>Export patient data as a CSV file for analysis.</Text>
                <Button
                  type="primary"
                  icon={<DownloadOutlined />}
                  onClick={handleExportData}
                >
                  Export Patient Data
                </Button>
              </div>
            </Card>
          </Col>

          {/* Account Management */}
          <Col xs={24}>
            <Card className="shadow-lg rounded-lg hover:shadow-xl transition-shadow">
              <Title level={4} className="mb-4 flex items-center">
                <UserOutlined className="mr-2 text-emerald-600" />
                Account Management
              </Title>
              <div className="space-y-4">
                <Button
                  type="primary"
                  icon={<UserOutlined />}
                  block
                  onClick={() => {
                    props.setActive("Hospital Profile")
                  }}
                >
                  Edit Profile
                </Button>
                <Divider />
                <Button
                  type="default"
                  danger
                  icon={<LogoutOutlined />}
                  block
                  onClick={handleSignOut}
                >
                  Sign Out
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default SettingsContent;