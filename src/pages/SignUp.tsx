import React from "react";
import AuthForm from "../components/AuthForm";

const SignUp = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Sign Up</h1>
      <AuthForm isSignUp={true} />
    </div>
  );
};

export default SignUp;
