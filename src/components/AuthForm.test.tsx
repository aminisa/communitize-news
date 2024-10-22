import { render, fireEvent, screen, waitFor } from "@testing-library/react";
import { auth, googleProvider } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { BrowserRouter as Router } from "react-router-dom";
import AuthForm from "../components/AuthForm";
import { getUserLocation } from "../api/open-cage";
import "@testing-library/jest-dom";

jest.mock("../firebase", () => ({
  auth: {},
  googleProvider: {},
}));
jest.mock("firebase/auth", () => ({
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signInWithPopup: jest.fn(),
}));
jest.mock("../api/open-cage", () => ({
  getUserLocation: jest.fn(),
}));

describe("AuthForm component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders sign-up fields correctly", () => {
    render(
      <Router>
        <AuthForm isSignUp={true} />
      </Router>
    );

    expect(screen.getByPlaceholderText("Username")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Confirm Password")).toBeInTheDocument();
  });

  test("renders sign-in fields correctly", () => {
    render(
      <Router>
        <AuthForm isSignUp={false} />
      </Router>
    );

    expect(screen.queryByPlaceholderText("Username")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
  });

  test("displays error when passwords do not match during sign-up", async () => {
    render(
      <Router>
        <AuthForm isSignUp={true} />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "password456" },
    });

    fireEvent.submit(screen.getByRole("button", { name: "Sign Up" }));

    expect(
      await screen.findByText("Passwords do not match")
    ).toBeInTheDocument();
  });

  test("successful sign-up calls createUserWithEmailAndPassword", async () => {
    (createUserWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: { uid: "123", email: "test@example.com" },
    });
    (getUserLocation as jest.Mock).mockResolvedValue("12345");

    render(
      <Router>
        <AuthForm isSignUp={true} />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Username"), {
      target: { value: "testuser" },
    });

    fireEvent.submit(screen.getByRole("button", { name: "Sign Up" }));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        "test@example.com",
        "password123"
      );
    });
  });

  test("successful sign-in calls signInWithEmailAndPassword", async () => {
    (signInWithEmailAndPassword as jest.Mock).mockResolvedValue({
      user: { uid: "123", email: "test@example.com" },
    });

    render(
      <Router>
        <AuthForm isSignUp={false} />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });

    fireEvent.submit(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
        auth,
        "test@example.com",
        "password123"
      );
    });
  });

  test("successful Google sign-in calls signInWithPopup", async () => {
    (signInWithPopup as jest.Mock).mockResolvedValue({
      user: { uid: "123", displayName: "testuser", email: "test@example.com" },
    });

    render(
      <Router>
        <AuthForm isSignUp={false} />
      </Router>
    );

    fireEvent.click(screen.getByText("Sign in with Google"));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalledWith(auth, googleProvider);
    });
  });
});
