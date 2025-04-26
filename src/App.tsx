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
import { useEmployeeStore } from "./store/employeeStore";

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [hasLoginPopupShown, setHasLoginPopupShown] = useState(false);
  const { fetchNotifications } = useEmployeeStore();

  // To track if the tab is focused
  const isTabFocused = useRef(true);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    // Fetch the initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        // Fetch notifications when session exists
        fetchNotifications();
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);

      if (event === "SIGNED_IN") {
        // Fetch notifications on sign in
        fetchNotifications();

        if (
          isTabFocused.current &&
          !hasLoginPopupShown &&
          !isInitialLoad.current
        ) {
          setPopupMessage("Logged in successfully!");
          setPopupVisible(true);
          setHasLoginPopupShown(true);
        }
      }

      if (event === "SIGNED_OUT" && isTabFocused.current) {
        setPopupMessage("Logged out successfully!");
        setPopupVisible(true);
        setHasLoginPopupShown(false);
      }

      isInitialLoad.current = false;
    });

    const handleVisibilityChange = () => {
      isTabFocused.current = document.visibilityState === "visible";
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hasLoginPopupShown, fetchNotifications]);

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

      <Popup
        message={popupMessage}
        isVisible={popupVisible}
        onClose={handleClosePopup}
      />
    </Router>
  );
}

export default App;
