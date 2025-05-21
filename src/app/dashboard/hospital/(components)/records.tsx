"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Table, Button, Modal, Form, Input, Select, DatePicker, message } from "antd";
import { EditOutlined, IdcardOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import { getPatients, registerPatient } from "@/actions/actions";

const { Option } = Select;

interface PatientForm {
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
}

const RecordsContent = () => {
  const { user } = useUser();
  const [patients, setPatients] = useState<PatientForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedPatient, setSelectedPatient] = useState<PatientForm | null>(null);

  const emailRegex = /^\S+@\S+\.\S+$/;
  const phoneRegex = /^[1-9]\d{9}$/;
  const uhnRegex = /^UHN[A-Z0-9]{6}$/;

  useEffect(() => {
    const fetchPatients = async () => {
      if (user) {
        setLoading(true);
        const response = await getPatients(user.id);
        if (response.success && response.data) {
          setPatients(response.data);
        } else {
          message.error(response.error || "Failed to fetch patients");
        }
        setLoading(false);
      }
    };
    fetchPatients();
  }, [user]);

  const handleUpdate = (patient: PatientForm) => {
    setSelectedPatient(patient);
    form.setFieldsValue({
      ...patient,
      dateOfBirth: patient.dateOfBirth ? dayjs(patient.dateOfBirth) : null,
    });
    setModalVisible(true);
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const formData = new FormData();
      formData.append("_id", selectedPatient?._id || "");
      formData.append("uhn", values.uhn);
      formData.append("firstName", values.firstName);
      formData.append("lastName", values.lastName);
      formData.append("dateOfBirth", values.dateOfBirth ? values.dateOfBirth.format("YYYY-MM-DD") : "");
      formData.append("gender", values.gender);
      formData.append("contact.phone", values.contact.phone);
      formData.append("contact.email", values.contact.email);
      formData.append("address.street", values.address.street);
      formData.append("address.city", values.address.city);
      formData.append("address.state", values.address.state);
      formData.append("address.country", values.address.country);
      formData.append("address.postalCode", values.address.postalCode);
      formData.append("hospitalId", user?.id || "");

      const response = await registerPatient(formData);
      if (response.success) {
        message.success("Patient updated successfully!");
        setModalVisible(false);
        form.resetFields();
        const fetchResponse = await getPatients(user?.id || "");
        if (fetchResponse.success && fetchResponse.data) {
          setPatients(fetchResponse.data);
        }
      } else {
        message.error(response.error || "Failed to update patient.");
      }
    } catch (error) {
      message.error("Please fix the form errors.");
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setSelectedPatient(null);
  };

  const disabledDate = (current: Dayjs) => {
    return current && current > dayjs().endOf("day");
  };

  const columns = [
    {
      title: "UHN",
      dataIndex: "uhn",
      key: "uhn",
    },
    {
      title: "Name",
      dataIndex: "firstName",
      key: "name",
      render: (_: any, record: PatientForm) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Date of Birth",
      dataIndex: "dateOfBirth",
      key: "dateOfBirth",
      render: (date: string) => (date ? dayjs(date).format("YYYY-MM-DD") : "-"),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
    },
    {
      title: "Phone",
      dataIndex: ["contact", "phone"],
      key: "phone",
    },
    {
      title: "Email",
      dataIndex: ["contact", "email"],
      key: "email",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: PatientForm) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => handleUpdate(record)}
          className="bg-emerald-600 hover:bg-emerald-700 border-none"
        >
          Update
        </Button>
      ),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
        <EditOutlined className="mr-2 text-emerald-600" />
        Patient Records
      </h2>
      <Table
        columns={columns}
        dataSource={patients}
        rowKey="_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        className="rounded-md overflow-hidden"
        scroll={{ x: true }}
      />
      <Modal
        title="Update Patient"
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        okButtonProps={{ className: "bg-emerald-600 hover:bg-emerald-700 border-none" }}
        cancelButtonProps={{ className: "border-gray-300" }}
        width={800}
      >
        <Form form={form} layout="vertical" className="space-y-4">
          <Form.Item
            name="uhn"
            label="Unique Health Number (UHN)"
            rules={[
              { required: true, message: "UHN is required" },
              { pattern: uhnRegex, message: "UHN must be in format UHNXXXXXXX (7 alphanumeric characters)" },
            ]}
          >
            <Input placeholder="Enter UHN (e.g., UHN1234567)" />
          </Form.Item>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, message: "First name is required" }]}
            >
              <Input placeholder="Enter first name" />
            </Form.Item>
            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: "Last name is required" }]}
            >
              <Input placeholder="Enter last name" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name="dateOfBirth"
              label="Date of Birth"
              rules={[{ required: true, message: "Date of birth is required" }]}
            >
              <DatePicker
                format="YYYY-MM-DD"
                disabledDate={disabledDate}
                className="w-full"
              />
            </Form.Item>
            <Form.Item
              name="gender"
              label="Gender"
              rules={[{ required: true, message: "Gender is required" }]}
            >
              <Select placeholder="Select gender">
                <Option value="Male">Male</Option>
                <Option value="Female">Female</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item
              name={["contact", "phone"]}
              label="Phone"
              rules={[
                { required: true, message: "Phone number is required" },
                { pattern: phoneRegex, message: "Invalid phone number format" },
              ]}
            >
              <Input placeholder="Enter phone number" />
            </Form.Item>
            <Form.Item
              name={["contact", "email"]}
              label="Email"
              rules={[
                { required: true, message: "Email is required" },
                { pattern: emailRegex, message: "Invalid email format" },
              ]}
            >
              <Input placeholder="Enter email" />
            </Form.Item>
          </div>
          <Form.Item name={["address", "street"]} label="Street">
            <Input placeholder="Enter street" />
          </Form.Item>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name={["address", "city"]} label="City">
              <Input placeholder="Enter city" />
            </Form.Item>
            <Form.Item name={["address", "state"]} label="State">
              <Input placeholder="Enter state" />
            </Form.Item>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Form.Item name={["address", "country"]} label="Country">
              <Input placeholder="Enter country" />
            </Form.Item>
            <Form.Item name={["address", "postalCode"]} label="Postal Code">
              <Input placeholder="Enter postal code" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RecordsContent;