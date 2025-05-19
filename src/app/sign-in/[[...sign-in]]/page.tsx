import { SignIn } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Property",
};

const SigninPage = () => {
  return (
    <div className="w-full min-h-screen flex justify-center items-center">
      <SignIn />
    </div>
  );
};

export default SigninPage;
