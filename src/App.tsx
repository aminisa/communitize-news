import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ZipCodeFeed from "./pages/ZipCodeFeed";
import NewsFeed from "./pages/NewsFeed";

const Layout = () => {
  const location = useLocation();

  return (
    <>
      <Header location={location} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/zip" element={<ZipCodeFeed />} />
        <Route path="/news/:zip" element={<NewsFeed />} />{" "}
      </Routes>
    </>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout />
      </Router>
    </AuthProvider>
  );
};

export default App;
