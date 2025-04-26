import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import Popup from "../components/Popup";

const RootLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const showPopup = (message: string) => {
    setPopupMessage(message);
    setIsPopupVisible(true);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        toggleSidebar={setIsSidebarCollapsed}
        onLogout={() => showPopup("Successfully logged out!")}
      />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${
          isSidebarCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <Header isCollapsed={isSidebarCollapsed} />
        <main className="container mx-auto">
          <Outlet />
        </main>
      </div>
      <Popup
        message={popupMessage}
        isVisible={isPopupVisible}
        onClose={() => setIsPopupVisible(false)}
      />
    </div>
  );
};

export default RootLayout;
