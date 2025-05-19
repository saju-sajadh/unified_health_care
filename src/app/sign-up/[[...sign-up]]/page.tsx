import { SignUp } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Property",
};

const SignupPage = () => {
  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <SignUp />
    </div>
  );
};

export default SignupPage;
