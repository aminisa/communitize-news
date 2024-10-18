import React from "react";
import AuthForm from "../components/AuthForm";

const SignIn = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Sign In</h1>
      <AuthForm isSignUp={false} />
    </div>
  );
};

export default SignIn;
