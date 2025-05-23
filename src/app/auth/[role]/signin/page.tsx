"use client";

import React, { useState, useCallback } from "react";
import { useSignIn } from "@clerk/nextjs";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Roles } from "@/types/global";

const SignInContent: React.FC = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  const router = useRouter();
  const params = useParams();
  const role = params.role as Roles;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!isLoaded) return;
      setButtonLoading(true);

      const isEmailValid = validateEmail(emailAddress);
      setEmailError(isEmailValid ? "" : "Invalid email address");

      if (!isEmailValid) {
        setButtonLoading(false);
        return;
      }

      if (!role || !["admin", "hospital", "government"].includes(role)) {
        setError("Invalid role specified");
        setButtonLoading(false);
        return;
      }

      try {
        const result = await signIn.create({
          identifier: emailAddress,
          password,
        });

        if (result.status === "complete") {
          await setActive({ session: result.createdSessionId });

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
          setError("Sign-in failed. Please check your credentials.");
        }
      } catch (err: any) {
        setError(err.errors?.[0]?.message || "An error occurred during sign-in");
        setPasswordError("Invalid password");
      } finally {
        setButtonLoading(false);
      }
    },
    [emailAddress, password, isLoaded, signIn, setActive, router, role]
  );

  if (!isLoaded) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <svg
          className="animate-spin h-8 w-8 text-blue-600"
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

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <div className="flex justify-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Unified HealthCare</h2>
        </div>
        <p className="text-blue-600 text-center mb-6 font-semibold text-lg">
          Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className={`mt-1 block w-full px-3 py-2 border ${
                emailError ? "border-red-500" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder="Enter your email"
            />
            {emailError && (
              <p className="mt-1 text-xs text-red-500">{emailError}</p>
            )}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 block w-full px-3 py-2 border ${
                  passwordError ? "border-red-500" : "border-gray-300"
                } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                placeholder="Enter your password"
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 cursor-pointer text-gray-600 hover:text-gray-800"
              >
                {showPassword ? (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7 1.275-4.057 5.065-7 9.543-7 1.723 0 3.376.463 4.708 1.297M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 0c0 4.418-4.477 8-10 8M9.834 9.834L3 3m0 18l18-18"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    ></path>
                  </svg>
                )}
              </span>
            </div>
            {passwordError && (
              <p className="mt-1 text-xs text-red-500">{passwordError}</p>
            )}
          </div>
          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}
          <div>
            <button
              type="submit"
              disabled={buttonLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 ${
                buttonLoading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {buttonLoading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
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
              ) : null}
              Sign In
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link
              href={`/auth/${role}/signup`}
              className="text-blue-600 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to Siddha’s{" "}
            <a href="#" className="underline hover:text-blue-600">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-blue-600">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

const SignInPage: React.FC = () => {
  return (
    <React.Suspense
      fallback={
        <div className="w-full h-screen flex justify-center items-center">
          <svg
            className="animate-spin h-8 w-8 text-blue-600"
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
      }
    >
      <SignInContent />
    </React.Suspense>
  );
};

export default SignInPage;