import React, { useEffect, useState, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { supabase } from "./lib/supabase";
import RootLayout from "./layouts/RootLayout";
import DashboardPage from "./pages/DashboardPage";
import EmployeesPage from "./pages/EmployeesPage";
import EmployeeDetails from "./pages/EmployeeDetails";
import DepartmentsPage from "./pages/DepartmentsPage";
import ProjectsPage from "./pages/ProjectsPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import Popup from "./components/Popup";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [hasLoginPopupShown, setHasLoginPopupShown] = useState(false); // Track if login popup has shown

  // To track if the tab is focused
  const isTabFocused = useRef(true);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    // Fetch the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      // Only show the popup on login if the tab is focused, and it hasn't been shown before
      if (
        event === "SIGNED_IN" &&
        isTabFocused.current &&
        !hasLoginPopupShown &&
        !isInitialLoad.current
      ) {
        setPopupMessage("Logged in successfully!");
        setPopupVisible(true);
        setHasLoginPopupShown(true); // Mark that the login popup has been shown
      }

      // Only show the popup on logout if the tab is focused
      if (event === "SIGNED_OUT" && isTabFocused.current) {
        setPopupMessage("Logged out successfully!");
        setPopupVisible(true);
        setHasLoginPopupShown(false); // Reset login popup status on logout
      }

      // Mark initial load as complete
      isInitialLoad.current = false;
    });

    // Handle the visibility change of the tab (focus vs. unfocused)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        isTabFocused.current = true; // Tab is focused
      } else {
        isTabFocused.current = false; // Tab is not focused
      }
    };

    // Attach event listener to detect visibility changes
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasLoginPopupShown]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleClosePopup = () => {
    setPopupVisible(false);
  };

  return (
    <Router>
      <Routes>
        {!session ? (
          <>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        ) : (
          <Route element={<RootLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/employees/:id" element={<EmployeeDetails />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>

      {/* Popup Component */}
      <Popup
        message={popupMessage}
        isVisible={popupVisible}
        onClose={handleClosePopup}
      />
    </Router>
  );
}

export default App;
