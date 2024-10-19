import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-800">
      <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full min-h-52 -mt-40 flex flex-col items-center">
        {" "}
        <h1 className="text-3xl text-white font-bold text-center">
          Welcome to Communitize!
        </h1>{" "}
        <p className="mt-6 text-[18px] text-white text-center">
          {" "}
          Search for news feeds in your area.
        </p>
        <Link
          to="/signin"
          className="mt-6 inline-block bg-blue-500 text-white w-3/4 text-center text-[18px] p-3 justify-center rounded hover:bg-blue-600 transition"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
};

export default Home;
