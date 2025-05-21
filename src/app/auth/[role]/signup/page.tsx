"use client";

import React, { useState, useCallback, useEffect, Suspense } from "react";
import { useSignUp } from "@clerk/nextjs";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Input, Typography, Select, DatePicker, Button, Row, Col } from "antd";
import { Roles } from "@/types/global";
import { createUser } from "@/actions/actions";
import Header from "@/components/Layout/Header";
import Link from "next/link";
import dayjs, { Dayjs } from "dayjs";

const { Title, Text } = Typography;

function SignupContent() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [step, setStep] = useState(0);

  // Hospital-specific fields
  const [hospitalName, setHospitalName] = useState("");
  const [hospitalCode, setHospitalCode] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [phone, setPhone] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [licenseNumber, setLicenseNumber] = useState("");
  const [establishedDate, setEstablishedDate] = useState<Dayjs | null>(null);

  // Government-specific fields
  const [organization, setOrganization] = useState("");
  const [region, setRegion] = useState("");

  // Admin-specific fields
  const [department, setDepartment] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const role = params.role as Roles;

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (pwd: string) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return passwordRegex.test(pwd);
  };

  const validateHospitalFields = () => {
    if (role !== "hospital") return true;
    return (
      hospitalName.length >= 3 &&
      hospitalCode.match(/^[A-Z0-9]{4,10}$/) &&
      licenseNumber.length > 0 &&
      street.length > 0 &&
      city.length > 0 &&
      state.length > 0 &&
      country.length > 0 &&
      postalCode.length > 0
    );
  };

  const validateGovernmentFields = () => {
    if (role !== "government") return true;
    return organization.length > 0 && region.length > 0;
  };

  const validateAdminFields = () => {
    if (role !== "admin") return true;
    return department.length > 0;
  };

  const validateStep = (currentStep: number) => {
    if (role === "hospital") {
      if (currentStep === 0) return hospitalName.length >= 3 && hospitalCode.match(/^[A-Z0-9]{4,10}$/);
      if (currentStep === 1) return licenseNumber.length > 0 && street.length > 0;
      if (currentStep === 2) return city.length > 0 && state.length > 0;
      if (currentStep === 3) return country.length > 0 && postalCode.length > 0;
      if (currentStep === 4) return phone.length > 0 && (!phone || /^\+?[1-9]\d{1,14}$/.test(phone)) && (!contactEmail || /^\S+@\S+\.\S+$/.test(contactEmail));
      if (currentStep === 5) return !website || /^https?:\/\/\S+$/.test(website);
      if (currentStep === 6) return true; // Departments and establishedDate are optional
      if (currentStep === 7) return validateEmail(emailAddress) && validatePassword(password);
    } else if (role === "government") {
      if (currentStep === 0) return organization.length > 0 && region.length > 0;
      if (currentStep === 1) return validateEmail(emailAddress) && validatePassword(password);
    } else if (role === "admin") {
      if (currentStep === 0) return department.length > 0;
      if (currentStep === 1) return validateEmail(emailAddress) && validatePassword(password);
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      setError("");
    } else {
      setError("Please fill in all required fields correctly.");
    }
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    setError("");
  };

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!isLoaded) return;
      setButtonLoading(true);

      const isEmailValid = validateEmail(emailAddress);
      const isPasswordValid = validatePassword(password);
      const isHospitalValid = validateHospitalFields();
      const isGovernmentValid = validateGovernmentFields();
      const isAdminValid = validateAdminFields();

      setEmailError(isEmailValid ? "" : "Invalid email address");
      setPasswordError(
        isPasswordValid
          ? ""
          : "Password must be at least 8 characters, include one uppercase, one lowercase, one number, and one special character"
      );

      if (
        !isEmailValid ||
        !isPasswordValid ||
        !isHospitalValid ||
        !isGovernmentValid ||
        !isAdminValid
      ) {
        setButtonLoading(false);
        return;
      }

      if (!role || !["admin", "hospital", "government"].includes(role)) {
        setError("Invalid role specified");
        setButtonLoading(false);
        return;
      }

      try {
        await signUp.create({
          emailAddress,
          password,
          unsafeMetadata: { role },
        });
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
        setPendingVerification(true);
        setError("");
      } catch (err: any) {
        setError(err.errors?.[0]?.message || "An error occurred");
      } finally {
        setButtonLoading(false);
      }
    },
    [
      emailAddress,
      password,
      isLoaded,
      signUp,
      role,
      hospitalName,
      hospitalCode,
      licenseNumber,
      street,
      city,
      state,
      country,
      postalCode,
      organization,
      region,
      department,
    ]
  );

  const handleVerify = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!isLoaded) return;
      setVerificationLoading(true);

      try {
        const attempt = await signUp.attemptEmailAddressVerification({ code });
        if (attempt.status === "complete" && attempt.createdUserId) {
          const userData: any = {
            userId: attempt.createdUserId,
            email: emailAddress,
            createdAt: new Date(),
            role,
          };

          if (role === "hospital") {
            userData.hospitalData = {
              name: hospitalName,
              hospitalCode,
              address: { street, city, state, country, postalCode },
              contact: { phone, email: contactEmail, website },
              departments,
              licenseNumber,
              establishedDate: establishedDate ? establishedDate.toDate() : undefined,
            };
          } else if (role === "government") {
            userData.governmentData = { organization, region };
          } else if (role === "admin") {
            userData.adminData = { department };
          }

          const result = await createUser(userData);

          if (!result.success) {
            setError("Failed to create user profile");
            setVerificationLoading(false);
            return;
          }

          await setActive({ session: attempt.createdSessionId });

          switch (role) {
            case "admin":
              router.push("/dashboard/admin");
              break;
            case "hospital":
              router.push("/dashboard/hospital");
              break;
            case "government":
              router.push("/dashboard/govt");
              break;
            default:
              router.push("/");
          }
        } else {
          setError("Verification failed");
        }
      } catch (err) {
        console.log(err)
        setError("Incorrect verification code");
      } finally {
        setVerificationLoading(false);
      }
    },
    [
      code,
      isLoaded,
      signUp,
      setActive,
      router,
      emailAddress,
      role,
      hospitalName,
      hospitalCode,
      street,
      city,
      state,
      country,
      postalCode,
      phone,
      contactEmail,
      website,
      departments,
      licenseNumber,
      establishedDate,
      organization,
      region,
      department,
    ]
  );

  useEffect(() => {
    const handleOAuthCallback = async () => {
      if (!isLoaded) return;

      const status = searchParams.get("status");
      if (status === "complete" && signUp.createdUserId) {
        const userData: any = {
          userId: signUp.createdUserId,
          email: signUp.emailAddress || "",
          createdAt: new Date(),
          role,
        };

        if (role === "hospital") {
          userData.hospitalData = {
            name: hospitalName,
            hospitalCode,
            address: { street, city, state, country, postalCode },
            contact: { phone, email: contactEmail, website },
            departments,
            licenseNumber,
            establishedDate: establishedDate ? establishedDate.toDate() : undefined,
          };
        } else if (role === "government") {
          userData.governmentData = { organization, region };
        } else if (role === "admin") {
          userData.adminData = { department };
        }

        const result = await createUser(userData);

        if (!result.success) {
          setError("Failed to create user profile");
          return;
        }

        await setActive({ session: signUp.createdSessionId });

        switch (role) {
          case "admin":
            router.push("/dashboard/admin");
            break;
          case "hospital":
            router.push("/dashboard/hospital");
            break;
          case "government":
            router.push("/dashboard/govt");
            break;
          default:
            router.push("/set-up");
        }
      } else if (status === "failed") {
        setError("Social sign-up failed. Please try again.");
      }
    };

    if (searchParams.get("status")) {
      handleOAuthCallback();
    }
  }, [
    isLoaded,
    signUp,
    setActive,
    router,
    searchParams,
    role,
    hospitalName,
    hospitalCode,
    street,
    city,
    state,
    country,
    postalCode,
    phone,
    contactEmail,
    website,
    departments,
    licenseNumber,
    establishedDate,
    organization,
    region,
    department,
  ]);

  const handleCodeChange = (text: string) => {
    setCode(text.toUpperCase());
  };

  const hospitalSteps = [
    [
      <Row key="hospitalName" gutter={[16, 16]}>
        <Col xs={24}>
          <label htmlFor="hospitalName" className="block text-sm font-medium text-gray-700">
            Hospital Name
          </label>
          <Input
            id="hospitalName"
            value={hospitalName}
            onChange={(e) => setHospitalName(e.target.value)}
            className="mt-1"
            status={hospitalName.length < 3 && hospitalName.length > 0 ? "error" : ""}
            placeholder="Enter hospital name"
          />
          {hospitalName.length < 3 && hospitalName.length > 0 && (
            <Text type="danger" className="text-xs mt-1">
              Hospital name must be at least 3 characters
            </Text>
          )}
        </Col>
      </Row>,
      <Row key="hospitalCode" gutter={[16, 16]}>
        <Col xs={24}>
          <label htmlFor="hospitalCode" className="block text-sm font-medium text-gray-700">
            Hospital Code
          </label>
          <Input
            id="hospitalCode"
            value={hospitalCode}
            onChange={(e) => setHospitalCode(e.target.value.toUpperCase())}
            className="mt-1"
            status={hospitalCode && !/^[A-Z0-9]{4,10}$/.test(hospitalCode) ? "error" : ""}
            placeholder="Enter hospital code"
          />
          {hospitalCode && !/^[A-Z0-9]{4,10}$/.test(hospitalCode) && (
            <Text type="danger" className="text-xs mt-1">
              Hospital code must be 4-10 alphanumeric characters
            </Text>
          )}
        </Col>
      </Row>,
    ],
    [
      <Row key="licenseNumber" gutter={[16, 16]}>
        <Col xs={24}>
          <label htmlFor="licenseNumber" className="block text-sm font-medium text-gray-700">
            License Number
          </label>
          <Input
            id="licenseNumber"
            value={licenseNumber}
            onChange={(e) => setLicenseNumber(e.target.value)}
            className="mt-1"
            placeholder="Enter license number"
          />
        </Col>
      </Row>,
      <Row key="street" gutter={[16, 16]}>
        <Col xs={24}>
          <label htmlFor="street" className="block text-sm font-medium text-gray-700">
            Street Address
          </label>
          <Input
            id="street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            className="mt-1"
            placeholder="Enter street address"
          />
        </Col>
      </Row>,
    ],
    [
      <Row key="city" gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            City
          </label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="mt-1"
            placeholder="Enter city"
          />
        </Col>
      </Row>,
      <Row key="state" gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <label htmlFor="state" className="block text-sm font-medium text-gray-700">
            State
          </label>
          <Input
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-1"
            placeholder="Enter state"
          />
        </Col>
      </Row>,
    ],
    [
      <Row key="country" gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700">
            Country
          </label>
          <Input
            id="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="mt-1"
            placeholder="Enter country"
          />
        </Col>
      </Row>,
      <Row key="postalCode" gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
            Postal Code
          </label>
          <Input
            id="postalCode"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            className="mt-1"
            placeholder="Enter postal code"
          />
        </Col>
      </Row>,
    ],
    [
      <Row key="phone" gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1"
            status={phone && !/^\+?[1-9]\d{1,14}$/.test(phone) ? "error" : ""}
            placeholder="Enter phone number"
          />
          {phone && !/^\+?[1-9]\d{1,14}$/.test(phone) && (
            <Text type="danger" className="text-xs mt-1">
              Invalid phone number format
            </Text>
          )}
        </Col>
      </Row>,
      <Row key="contactEmail" gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
            Contact Email
          </label>
          <Input
            id="contactEmail"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="mt-1"
            status={contactEmail && !/^\S+@\S+\.\S+$/.test(contactEmail) ? "error" : ""}
            placeholder="Enter contact email"
          />
          {contactEmail && !/^\S+@\S+\.\S+$/.test(contactEmail) && (
            <Text type="danger" className="text-xs mt-1">
              Invalid email format
            </Text>
          )}
        </Col>
      </Row>,
    ],
    [
      <Row key="website" gutter={[16, 16]}>
        <Col xs={24}>
          <label htmlFor="website" className="block text-sm font-medium text-gray-700">
            Website
          </label>
          <Input
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className="mt-1"
            status={website && !/^https?:\/\/\S+$/.test(website) ? "error" : ""}
            placeholder="Enter website URL"
          />
          {website && !/^https?:\/\/\S+$/.test(website) && (
            <Text type="danger" className="text-xs mt-1">
              Invalid website URL
            </Text>
          )}
        </Col>
      </Row>,
    ],
    [
      <Row key="departments" gutter={[16, 16]}>
        <Col xs={24}>
          <label htmlFor="departments" className="block text-sm font-medium text-gray-700">
            Departments
          </label>
          <Select
            mode="tags"
            style={{ width: "100%" }}
            placeholder="Select or add departments"
            onChange={(value) => setDepartments(value)}
            value={departments}
            className="mt-1"
          />
        </Col>
      </Row>,
      <Row key="establishedDate" gutter={[16, 16]}>
        <Col xs={24}>
          <label htmlFor="establishedDate" className="block text-sm font-medium text-gray-700">
            Established Date
          </label>
          <DatePicker
            id="establishedDate"
            onChange={(date) => setEstablishedDate(date)}
            className="mt-1 w-full"
            placeholder="Select established date"
          />
        </Col>
      </Row>,
    ],
    [
      <Row key="email" gutter={[16, 16]}>
        <Col xs={24}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            type="email"
            id="email"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="mt-1"
            status={emailError ? "error" : ""}
            placeholder="Enter your email"
          />
          {emailError && (
            <Text type="danger" className="text-xs mt-1">
              {emailError}
            </Text>
          )}
        </Col>
      </Row>,
      <Row key="password" gutter={[16, 16]}>
        <Col xs={24}>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              status={passwordError ? "error" : ""}
              placeholder="Enter your password"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 cursor-pointer text-gray-600 hover:text-gray-800"
            >
              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </span>
          </div>
          {passwordError && (
            <Text type="danger" className="text-xs mt-1">
              {passwordError}
            </Text>
          )}
        </Col>
      </Row>,
    ],
  ];

  const governmentSteps = [
    [
      <Row key="organization" gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <label htmlFor="organization" className="block text-sm font-medium text-gray-700">
            Organization
          </label>
          <Input
            id="organization"
            value={organization}
            onChange={(e) => setOrganization(e.target.value)}
            className="mt-1"
            placeholder="Enter organization name"
          />
        </Col>
      </Row>,
      <Row key="region" gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <label htmlFor="region" className="block text-sm font-medium text-gray-700">
            Region
          </label>
          <Input
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="mt-1"
            placeholder="Enter region"
          />
        </Col>
      </Row>,
    ],
    [
      <Row key="email" gutter={[16, 16]}>
        <Col xs={24}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            type="email"
            id="email"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="mt-1"
            status={emailError ? "error" : ""}
            placeholder="Enter your email"
          />
          {emailError && (
            <Text type="danger" className="text-xs mt-1">
              {emailError}
            </Text>
          )}
        </Col>
      </Row>,
      <Row key="password" gutter={[16, 16]}>
        <Col xs={24}>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              status={passwordError ? "error" : ""}
              placeholder="Enter your password"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 cursor-pointer text-gray-600 hover:text-gray-800"
            >
              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </span>
          </div>
          {passwordError && (
            <Text type="danger" className="text-xs mt-1">
              {passwordError}
            </Text>
          )}
        </Col>
      </Row>,
    ],
  ];

  const adminSteps = [
    [
      <Row key="department" gutter={[16, 16]}>
        <Col xs={24}>
          <label htmlFor="department" className="block text-sm font-medium text-gray-700">
            Department
          </label>
          <Input
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="mt-1"
            placeholder="Enter department name"
          />
        </Col>
      </Row>,
    ],
    [
      <Row key="email" gutter={[16, 16]}>
        <Col xs={24}>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            type="email"
            id="email"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="mt-1"
            status={emailError ? "error" : ""}
            placeholder="Enter your email"
          />
          {emailError && (
            <Text type="danger" className="text-xs mt-1">
              {emailError}
            </Text>
          )}
        </Col>
      </Row>,
      <Row key="password" gutter={[16, 16]}>
        <Col xs={24}>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1"
              status={passwordError ? "error" : ""}
              placeholder="Enter your password"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 cursor-pointer text-gray-600 hover:text-gray-800"
            >
              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            </span>
          </div>
          {passwordError && (
            <Text type="danger" className="text-xs mt-1">
              {passwordError}
            </Text>
          )}
        </Col>
      </Row>,
    ],
  ];

  const steps = role === "hospital" ? hospitalSteps : role === "government" ? governmentSteps : adminSteps;

  if (!isLoaded) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <LoadingOutlined className="text-blue-600 text-2xl" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Header />
      {!pendingVerification ? (
        <div className="w-full max-w-2xl p-8 bg-white rounded-xl shadow-lg mt-10 lg:mt-0">
          <div className="flex justify-center mb-6">
            <Title level={2} className="text-gray-900 flex items-center">
              Unified HealthCare
            </Title>
          </div>
          <Text className="text-blue-600 text-center mb-6 font-semibold text-lg block">
            Sign Up as {role.charAt(0).toUpperCase() + role.slice(1)}
          </Text>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${step * 100}%)` }}
              >
                {steps.map((stepFields, index) => (
                  <div key={index} className="w-full flex-shrink-0 space-y-6">
                    {stepFields}
                  </div>
                ))}
              </div>
            </div>
            {error && (
              <Text type="danger" className="text-sm text-center block">
                {error}
              </Text>
            )}
            <div id="clerk-captcha" className="mt-2"></div>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={step > 0 ? 12 : 24}>
                {step > 0 && (
                  <Button
                    type="default"
                    onClick={handlePrevStep}
                    className="w-full transition-colors duration-200"
                  >
                    Previous
                  </Button>
                )}
              </Col>
              <Col xs={24} sm={step > 0 ? 12 : 24}>
                {step < steps.length - 1 ? (
                  <Button
                    type="primary"
                    onClick={handleNextStep}
                    className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    Next
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={buttonLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                  >
                    Sign Up
                  </Button>
                )}
              </Col>
            </Row>
          </form>
          <div className="mt-6 text-center">
            <Text className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href={`/auth/${role}/signin`} className="text-blue-600 hover:underline">
                Log in
              </Link>
            </Text>
          </div>
          <div className="mt-4 text-center">
            <Text className="text-xs text-gray-500">
              By continuing, you agree to Siddha’s{" "}
              <a href="#" className="underline hover:text-blue-600">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-blue-600">
                Privacy Policy
              </a>
              .
            </Text>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
          <div className="flex justify-center items-center mb-6">
            <Title level={2} className="text-gray-900">
              Unified HealthCare
            </Title>
          </div>
          <div className="flex flex-col gap-4 justify-center items-center">
            <Title level={5} className="text-center">
              Enter Verification Code
            </Title>
            <Input.OTP
              length={6}
              formatter={(str) => str.replace(/[^0-9]/g, "")}
              onChange={handleCodeChange}
              size="large"
              value={code}
              className="w-full"
            />
            <Button
              type="primary"
              onClick={handleVerify}
              loading={verificationLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
            >
              Verify
            </Button>
          </div>
          {error && (
            <Text type="danger" className="text-sm mt-2 text-center block">
              {error}
            </Text>
          )}
        </div>
      )}
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full h-screen flex justify-center items-center">
          <LoadingOutlined className="text-blue-600 text-2xl" />
        </div>
      }
    >
      <SignupContent />
    </Suspense>
  );
}