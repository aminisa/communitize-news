import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";

const Header = () => {
  const context = useContext(AuthContext);

  if (!context) {
    return null;
  }

  const { user } = context;

  const handleLogout = async () => {
    await signOut(auth);
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">
        Communitize
      </Link>
      <nav className="space-x-4">
        {!user ? (
          <>
            <Link to="/signin" className="hover:text-gray-400">
              Sign In
            </Link>
            <Link to="/signup" className="hover:text-gray-400">
              Sign Up
            </Link>
          </>
        ) : (
          <>
            <Link to="/" className="hover:text-gray-400">
              <FaSearch className="inline-block" /> Search ZIP Code
            </Link>
            <button onClick={handleLogout} className="hover:text-gray-400">
              Log Out
            </button>
            <FaUserCircle className="inline-block text-2xl" />
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
