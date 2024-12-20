import React, { useEffect, useState } from "react";
import { auth, googleProvider, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { getUserLocation } from "../api/open-cage";
import { doc, setDoc, getDoc } from "firebase/firestore";

interface AuthFormProps {
  isSignUp: boolean;
}

const AuthForm: React.FC<AuthFormProps> = ({ isSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [zipCode, setZipCode] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchZipCode = async () => {
      const zip = await getUserLocation();
      setZipCode(zip);
    };

    fetchZipCode();
  }, []);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await updateProfile(userCredential.user, { displayName: username });

        await setDoc(doc(db, "users", userCredential.user.uid), {
          username,
          email,
          zipCode,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate("/zip");
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const user = userCredential.user;

      const username = user.displayName || user.email;

      const userDocRef = doc(db, "users", user.uid);
      const userDocSnapshot = await getDoc(userDocRef);

      if (!userDocSnapshot.exists()) {
        await setDoc(userDocRef, {
          username,
          email: user.email,
          zipCode,
        });
      }

      navigate("/zip");
    } catch (error: any) {
      setError(error.message);
    }
  };

  return (
    <div className="w-full">
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleAuth}>
        {isSignUp && (
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-2 mb-3 border rounded"
              required
            />
          </div>
        )}
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 mb-3 border rounded"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 mb-3 border rounded"
            required
          />
        </div>
        {isSignUp && (
          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-2 mb-3 border rounded"
              required
            />
          </div>
        )}
        <button
          type="submit"
          className="w-full p-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
        >
          {isSignUp ? "Sign Up" : "Sign In"}
        </button>
      </form>

      <div className="flex items-center my-4">
        <hr className="flex-grow border-t border-gray-300" />
        <span className="mx-2 text-gray-500">OR</span>
        <hr className="flex-grow border-t border-gray-300" />
      </div>

      <div className="mt-4">
        <button
          onClick={handleGoogleSignIn}
          className="w-full p-2 bg-white text-gray-700 border border-gray-300 rounded flex items-center justify-center space-x-2 hover:bg-gray-100"
        >
          <FcGoogle className="text-xl" />
          <span>Sign in with Google</span>
        </button>
      </div>
    </div>
  );
};

export default AuthForm;
