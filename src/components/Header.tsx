import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { Location } from "react-router-dom";

interface HeaderProps {
  location: Location;
}

const Header: React.FC<HeaderProps> = ({ location }) => {
  const context = useContext(AuthContext);

  if (!context) {
    return null;
  }

  const { user } = context;

  const handleLogout = async () => {
    await signOut(auth);
  };

  const hideHeaderLinks = ["/", "/signin", "/signup"].includes(
    location.pathname
  );

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-xl font-bold">
        Communitize
      </Link>
      {!hideHeaderLinks && (
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
              <button onClick={handleLogout} className="hover:text-gray-400">
                Log Out
              </button>
            </>
          )}
        </nav>
      )}
    </header>
  );
};

export default Header;
