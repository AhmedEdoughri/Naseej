import React from "react";
import { Navigate } from "react-router-dom";
import useInactivityTimeout from "../hooks/useInactivityTimeout";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem("token");

  // If the user has a token, they are logged in, so we activate the inactivity timer.
  // This hook will automatically handle logging them out if they are inactive.
  if (token) {
    useInactivityTimeout();
  }

  if (!token) {
    // If there's no token, redirect the user to the login page
    return <Navigate to="/login" replace />;
  }

  // If the user is authenticated, render the page they requested
  return children;
};

export default ProtectedRoute;
