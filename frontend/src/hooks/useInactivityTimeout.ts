import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// This hook will track user activity and log them out after a period of inactivity.
const useInactivityTimeout = (timeout = 15 * 60 * 1000) => {
  // Default timeout is 15 minutes
  const navigate = useNavigate();
  const timer = useRef<NodeJS.Timeout | null>(null);

  // This function handles the actual logout procedure
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");

    toast.info("Session Expired", {
      description: "You have been logged out due to inactivity.",
    });
    navigate("/login");
  }, [navigate]);

  // This function resets the timer whenever the user is active
  const resetTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
    timer.current = setTimeout(handleLogout, timeout);
  }, [handleLogout, timeout]);

  useEffect(() => {
    // List of events that indicate user activity
    const events = ["mousemove", "keydown", "click", "scroll"];

    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners for all activity events
    events.forEach((event) => {
      window.addEventListener(event, handleActivity);
    });

    // Start the timer initially
    resetTimer();

    // Cleanup function to remove listeners when the component unmounts
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
      if (timer.current) {
        clearTimeout(timer.current);
      }
    };
  }, [resetTimer]);

  return null; // This hook does not render any UI
};

export default useInactivityTimeout;
