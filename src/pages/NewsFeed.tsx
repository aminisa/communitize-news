import React from "react";
import { useParams } from "react-router-dom";

const NewsFeed = () => {
  const { zip } = useParams<{ zip: string }>();

  return (
    <div className="min-h-screen bg-gray-800 p-8">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">
          Posts for ZIP Code: {zip}
        </h1>
        <p>Here are the posts related to ZIP Code {zip}.</p>
      </div>
    </div>
  );
};

export default NewsFeed;
