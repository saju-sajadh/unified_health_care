"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Card, Spin, message, Tag, Typography, Button, Form, Input, DatePicker, Select, Collapse, Row, Col } from "antd";
import { EnvironmentOutlined, PhoneOutlined, MailOutlined, GlobalOutlined, TeamOutlined, IdcardOutlined, EditOutlined } from "@ant-design/icons";
import { getHospitalProfile, updateHospitalProfile } from "@/actions/actions";
import { HospitalProfile, Address, Contact } from "@/types/types";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Option } = Select;
const { Panel } = Collapse;

const ProfileContent = () => {
  const { user } = useUser();
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setLoading(true);
        try {
          const response = await getHospitalProfile(user.id);
          if (response.success && response.data) {
            setProfile(response.data);
            form.setFieldsValue({
              name: response.data.name,
              hospitalCode: response.data.hospitalCode,
              contact: response.data.contact,
              address: response.data.address,
              departments: response.data.departments,
              licenseNumber: response.data.licenseNumber,
              establishedDate: response.data.establishedDate ? dayjs(response.data.establishedDate) : null,
            });
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
  }, [user, form]);

  const handleUpdateProfile = async (values: any) => {
    if (!user) return;

    try {
      const updatedProfile: Partial<HospitalProfile> = {
        name: values.name,
        hospitalCode: values.hospitalCode,
        contact: values.contact,
        address: values.address,
        departments: values.departments,
        licenseNumber: values.licenseNumber,
        establishedDate: values.establishedDate ? values.establishedDate.toISOString() : undefined,
      };

      const response = await updateHospitalProfile(user.id, updatedProfile);
      if (response.success && response.data) {
        setProfile(response.data);
        message.success("Profile updated successfully");
        setEditMode(false);
      } else {
        message.error(response.error || "Failed to update hospital profile");
      }
    } catch (error) {
      message.error("Error updating hospital profile");
    }
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
    <div className="bg-gray-100 min-h-screen">
      {/* Hero Section */}
      <div className="bg-emerald-600 text-white py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Title level={1} className="!text-white mb-2">
            {profile.name || ""}
          </Title>
          <Text className="text-emerald-100 text-lg">
            {profile.hospitalCode ? `Code: ${profile.hospitalCode}` : "No Code Assigned"}
          </Text>
          <div className="mt-4">
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto p-6 -mt-16">
        {editMode ? (
          <Card className="shadow-lg rounded-lg">
            <Title level={4} className="mb-6">Edit Hospital Profile</Title>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdateProfile}
            >
              <Collapse defaultActiveKey={["1", "2", "3"]} expandIconPosition="right">
                <Panel
                  header={
                    <span className="flex items-center">
                      <IdcardOutlined className="mr-2 text-emerald-600" />
                      Basic Information
                    </span>
                  }
                  key="1"
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="name"
                        label="Hospital Name"
                        rules={[{ required: true, message: "Please enter the hospital name" }]}
                      >
                        <Input placeholder="Enter hospital name" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="hospitalCode"
                        label="Hospital Code"
                      >
                        <Input placeholder="Enter hospital code" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>

                <Panel
                  header={
                    <span className="flex items-center">
                      <PhoneOutlined className="mr-2 text-emerald-600" />
                      Contact Information
                    </span>
                  }
                  key="2"
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name={["contact", "email"]}
                        label="Email"
                        rules={[{ type: "email", message: "Please enter a valid email" }]}
                      >
                        <Input placeholder="Enter email" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name={["contact", "phone"]}
                        label="Phone"
                      >
                        <Input placeholder="Enter phone number" />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item
                        name={["contact", "website"]}
                        label="Website"
                        rules={[{ type: "url", message: "Please enter a valid URL" }]}
                      >
                        <Input placeholder="Enter website URL" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>

                <Panel
                  header={
                    <span className="flex items-center">
                      <EnvironmentOutlined className="mr-2 text-emerald-600" />
                      Address
                    </span>
                  }
                  key="3"
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <Form.Item
                        name={["address", "street"]}
                        label="Street"
                      >
                        <Input placeholder="Enter street address" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name={["address", "city"]}
                        label="City"
                      >
                        <Input placeholder="Enter city" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name={["address", "state"]}
                        label="State"
                      >
                        <Input placeholder="Enter state" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name={["address", "country"]}
                        label="Country"
                      >
                        <Input placeholder="Enter country" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name={["address", "postalCode"]}
                        label="Postal Code"
                      >
                        <Input placeholder="Enter postal code" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>

                <Panel
                  header={
                    <span className="flex items-center">
                      <TeamOutlined className="mr-2 text-emerald-600" />
                      Hospital Details
                    </span>
                  }
                  key="4"
                >
                  <Row gutter={[16, 16]}>
                    <Col xs={24}>
                      <Form.Item
                        name="departments"
                        label="Departments"
                      >
                        <Select
                          mode="tags"
                          allowClear
                          placeholder="Enter departments (e.g., Cardiology, Neurology)"
                        >
                          {profile.departments?.map((dept) => (
                            <Option key={dept} value={dept}>
                              {dept}
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="licenseNumber"
                        label="License Number"
                      >
                        <Input placeholder="Enter license number" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        name="establishedDate"
                        label="Established Date"
                      >
                        <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Panel>
              </Collapse>

              <Form.Item className="mt-6">
                <Button type="primary" htmlType="submit">
                  Save Changes
                </Button>
                <Button
                  className="ml-2"
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </Button>
              </Form.Item>
            </Form>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Information Card */}
            <Card className="shadow-lg rounded-lg overflow-hidden">
              <Title level={4} className="mb-4 flex items-center">
                <PhoneOutlined className="mr-2 text-emerald-600" /> Contact Information
              </Title>
              <div className="space-y-3">
                <div className="flex items-center">
                  <MailOutlined className="text-gray-500 mr-2" />
                  <Text>{profile.contact?.email || "N/A"}</Text>
                </div>
                <div className="flex items-center">
                  <PhoneOutlined className="text-gray-500 mr-2" />
                  <Text>{profile.contact?.phone || "N/A"}</Text>
                </div>
                <div className="flex items-center">
                  <GlobalOutlined className="text-gray-500 mr-2" />
                  <a href={profile.contact?.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                    {profile.contact?.website || "N/A"}
                  </a>
                </div>
              </div>
            </Card>

            {/* Address Card */}
            <Card className="shadow-lg rounded-lg">
              <Title level={4} className="mb-4 flex items-center">
                <EnvironmentOutlined className="mr-2 text-emerald-600" /> Address
              </Title>
              <div className="space-y-2">
                <Text>{profile.address?.street || "N/A"}</Text>
                <Text>
                  {profile.address?.city && profile.address?.state
                    ? `${profile.address.city}, ${profile.address.state}`
                    : "N/A"}
                </Text>
                <Text>{profile.address?.country || "N/A"}</Text>
                <Text>{profile.address?.postalCode || "N/A"}</Text>
              </div>
            </Card>

            {/* Status Card */}
            <Card className="shadow-lg rounded-lg">
              <Title level={4} className="mb-4 flex items-center">
                <IdcardOutlined className="mr-2 text-emerald-600" /> Status
              </Title>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Text strong className="mr-2">Active:</Text>
                  <Tag color={profile.isActive ? "green" : "red"}>
                    {profile.isActive ? "Active" : "Inactive"}
                  </Tag>
                </div>
                <div className="flex items-center">
                  <Text strong className="mr-2">Role:</Text>
                  <Text>{profile.role || "N/A"}</Text>
                </div>
              </div>
            </Card>

            {/* Additional Details */}
            <Card className="mt-6 shadow-lg rounded-lg col-span-1 md:col-span-3">
              <Title level={4} className="mb-4">Hospital Details</Title>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Text strong>License Number:</Text>
                  <p>{profile.licenseNumber || "N/A"}</p>
                </div>
                <div>
                  <Text strong>Established Date:</Text>
                  <p>
                    {profile.establishedDate
                      ? dayjs(profile.establishedDate).format("MMMM D, YYYY")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Text strong>User ID:</Text>
                  <p>{profile.userId || "N/A"}</p>
                </div>
                <div>
                  <Text strong>Email:</Text>
                  <p>{profile.email || "N/A"}</p>
                </div>
                <div>
                  <Text strong>Created At:</Text>
                  <p>
                    {profile.createdAt
                      ? dayjs(profile.createdAt).format("MMMM D, YYYY HH:mm")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <Text strong>Updated At:</Text>
                  <p>
                    {profile.updatedAt
                      ? dayjs(profile.updatedAt).format("MMMM D, YYYY HH:mm")
                      : "N/A"}
                  </p>
                </div>
              </div>
            </Card>

            {/* Departments */}
            <Card className="mt-6 shadow-lg rounded-lg col-span-1 md:col-span-3">
              <Title level={4} className="mb-4 flex items-center">
                <TeamOutlined className="mr-2 text-emerald-600" /> Departments
              </Title>
              {profile.departments && profile.departments.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.departments.map((dept, index) => (
                    <p key={index} className="!text-sm text-emerald-600 bg-slate-100 px-3 py-1 rounded-lg">
                      {dept}
                    </p>
                  ))}
                </div>
              ) : (
                <Text>No departments listed</Text>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileContent;