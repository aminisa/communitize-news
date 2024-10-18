import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-800">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full min-h-52 -mt-32 flex flex-col items-center">
        {" "}
        <h1 className="text-3xl font-bold text-center">
          Welcome to Communitize!
        </h1>{" "}
        <p className="mt-6 text-[18px] text-center">
          {" "}
          Search for news feeds in your area.
        </p>
        <Link
          to="/signin"
          className="mt-6 inline-block bg-blue-500 text-white text-[18px] p-3 justify-center rounded hover:bg-blue-600 transition"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default Home;
