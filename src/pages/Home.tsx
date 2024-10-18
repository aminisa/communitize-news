import React from "react";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Welcome to Communitize</h1>
      <p className="mt-4">
        Search for ZIP codes or explore news feeds in your area.
      </p>
      <Link
        to="/signup"
        className="mt-4 inline-block bg-blue-500 text-white p-2 rounded"
      >
        Get Started
      </Link>
    </div>
  );
};

export default Home;
