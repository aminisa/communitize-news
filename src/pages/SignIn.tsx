import React from "react";
import AuthForm from "../components/AuthForm";
import { Link } from "react-router-dom";

const SignIn = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-800">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-lg w-full -mt-32 min-h-52 flex flex-col items-center">
        <h1 className="text-3xl -mt-3 font-bold text-center">Sign In</h1>
        <p className="text-[18px] mt-3 mb-3">Please enter your details.</p>
        <div className="mt-3 w-full">
          <AuthForm isSignUp={false} />
        </div>
        <p className="mt-4 -mb-3 text-center">
          Don't have an account yet? {""}
          <Link
            to="/signup"
            className="text-blue-500 hover:text-blue-600 font-semibold"
          >
            Create one!
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
