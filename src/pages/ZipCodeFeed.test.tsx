import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useNavigate } from "react-router-dom";
import ZipCodeFeed from "./ZipCodeFeed";
import { getUserLocation } from "../api/open-cage";

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../api/open-cage", () => ({
  getUserLocation: jest.fn(),
}));

const mockNavigate = jest.fn();

describe("ZipCodeFeed", () => {
  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders the ZipCodeFeed component", () => {
    render(<ZipCodeFeed />);
    expect(screen.getByText(/ZIP Code/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ZIP Code/i)).toBeInTheDocument();
    expect(screen.getByText(/Get News/i)).toBeInTheDocument();
    expect(screen.getByText(/Use Current Location/i)).toBeInTheDocument();
  });

  test("submits the form with a valid ZIP code", () => {
    render(<ZipCodeFeed />);
    const input = screen.getByPlaceholderText(/ZIP Code/i);
    const button = screen.getByText(/Get News/i);

    fireEvent.change(input, { target: { value: "12345" } });
    fireEvent.click(button);

    expect(mockNavigate).toHaveBeenCalledWith("/news/12345");
  });

  test("shows error message with an invalid ZIP code", () => {
    render(<ZipCodeFeed />);
    const input = screen.getByPlaceholderText(/ZIP Code/i);
    const button = screen.getByText(/Get News/i);

    fireEvent.change(input, { target: { value: "1234" } });
    fireEvent.click(button);

    expect(
      screen.getByText(/Please enter a valid 5-digit ZIP code/i)
    ).toBeInTheDocument();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  test("fetches user location ZIP code and navigates", async () => {
    (getUserLocation as jest.Mock).mockResolvedValueOnce("54321");
    render(<ZipCodeFeed />);

    const button = screen.getByText(/Use Current Location/i);

    fireEvent.click(button);

    expect(screen.getByText(/Fetching ZIP Code.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(getUserLocation).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/news/54321");
    });
  });

  test("shows error when unable to fetch user location ZIP code", async () => {
    (getUserLocation as jest.Mock).mockResolvedValueOnce(null);
    render(<ZipCodeFeed />);

    const button = screen.getByText(/Use Current Location/i);

    fireEvent.click(button);

    expect(screen.getByText(/Fetching ZIP Code.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText(/Unable to fetch your ZIP code from location./i)
      ).toBeInTheDocument();
    });
  });
});
