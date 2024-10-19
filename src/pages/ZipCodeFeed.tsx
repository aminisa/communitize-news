import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUserLocation } from "../api/open-cage";

const ZipCodeFeed = () => {
  const [zip, setZip] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleZipCodeSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const zipCodePattern = /^\d{5}$/;
    if (!zipCodePattern.test(zip)) {
      setError("Please enter a valid 5-digit ZIP code.");
      return;
    }

    navigate(`/news/${zip}`);
  };

  const fetchUserLocationZip = async () => {
    setLoading(true);
    setError("");

    const userZip = await getUserLocation();
    if (userZip) {
      setZip(userZip);
      navigate(`/news/${userZip}`);
    } else {
      setError("Unable to fetch your ZIP code from location.");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-800">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-lg w-1/2 -mt-32 flex flex-col items-center">
        <h1 className="text-3xl font-bold text-center mb-4">ZIP Code</h1>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <form onSubmit={handleZipCodeSubmit} className="flex flex-col w-full">
          <input
            type="text"
            placeholder="ZIP Code"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
            className="p-2 mb-4 border rounded bg-gray-200 text-gray-800"
            required
          />
          <button
            type="submit"
            className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
          >
            Get News
          </button>
        </form>

        <div className="flex items-center my-4 w-full">
          <hr className="flex-grow border-t border-gray-300" />
          <span className="px-2 text-gray-500">OR</span>
          <hr className="flex-grow border-t border-gray-300" />
        </div>

        <div className="w-full">
          <button
            onClick={fetchUserLocationZip}
            className="w-full p-2 bg-gray-500 hover:bg-gray-600 text-white rounded"
            disabled={loading}
          >
            {loading ? "Fetching ZIP Code..." : "Use Current Location"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ZipCodeFeed;
