import React, { useState } from "react";
import { Rocket, Bell, MoreHorizontal } from "lucide-react";
import { useEmployeeStore } from "../store/employeeStore";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

// Ensure the Notification type matches the updated definition in employeeStore.ts
interface Notification {
  id: number;
  message: string;
  type: string;
  link: string;
  isRead: boolean;
  timestamp: string;
}

interface HeaderProps {
  isCollapsed: boolean;
}

const Header = ({ isCollapsed }: HeaderProps) => {
  const { notifications, markNotificationAsRead } = useEmployeeStore();
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [activeEllipsis, setActiveEllipsis] = useState<number | null>(null);

  const handleNotificationClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleEllipsis = (id: number) => {
    setActiveEllipsis((prev) => (prev === id ? null : id));
  };

  const handleNotificationItemClick = (notification: Notification) => {
    markNotificationAsRead(notification.id);
    setIsDropdownOpen(false); // Automatically close the dropdown
    navigate(notification.link);
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach((notification) => {
      if (!notification.isRead) {
        markNotificationAsRead(notification.id);
      }
    });
  };

  const handleMarkAsUnread = (id: number) => {
    useEmployeeStore.setState((state) => {
      const updatedNotifications = state.notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: false }
          : notification
      );

      // Persist the updated notifications to localStorage
      localStorage.setItem(
        "notifications",
        JSON.stringify(updatedNotifications)
      );

      return { notifications: updatedNotifications };
    });
  };

  const handleDeleteNotification = (id: number) => {
    useEmployeeStore.setState((state) => {
      const updatedNotifications = state.notifications.filter(
        (notification) => notification.id !== id
      );

      // Persist the updated notifications to localStorage
      localStorage.setItem(
        "notifications",
        JSON.stringify(updatedNotifications)
      );

      return { notifications: updatedNotifications };
    });
  };

  const filteredNotifications =
    filter === "all" ? notifications : notifications.filter((n) => !n.isRead);

  return (
    <div className="h-16 px-4 border-b flex items-center bg-white">
      {isCollapsed && (
        <div className="flex items-center ml-4">
          <Rocket className="w-6 h-6 text-primary mr-2" />
          <h1 className="text-2xl font-bold text-primary">Propel</h1>
        </div>
      )}
      <div
        className="ml-auto relative cursor-pointer"
        onClick={handleNotificationClick}
      >
        <Bell className="w-5 h-5 text-gray-700 mr-4" />
        {notifications.filter((n) => !n.isRead).length > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {notifications.filter((n) => !n.isRead).length}
          </span>
        )}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg">
            <div className="flex justify-between items-center p-2 border-b">
              <div className="flex space-x-4">
                <button
                  className={`px-4 py-2 ${
                    filter === "all" ? "font-bold text-primary" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilter("all");
                  }}
                >
                  All
                </button>
                <button
                  className={`px-4 py-2 ${
                    filter === "unread" ? "font-bold text-primary" : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilter("unread");
                  }}
                >
                  Unread
                </button>
              </div>
              <button
                className="text-sm text-gray-500 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleMarkAllAsRead();
                }}
              >
                Mark All as Read
              </button>
            </div>
            {filteredNotifications.length === 0 ? (
              <div className="p-4 text-gray-500">No notifications</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {filteredNotifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`p-4 cursor-pointer flex justify-between items-center ${
                      notification.isRead ? "bg-gray-100" : "bg-blue-50"
                    } hover:bg-gray-50`}
                  >
                    <div
                      onClick={() => handleNotificationItemClick(notification)}
                    >
                      <span className="block font-medium">
                        {notification.message}
                      </span>
                      <span className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.timestamp), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                    <div className="relative">
                      <MoreHorizontal
                        className="w-5 h-5 text-gray-500 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEllipsis(notification.id);
                        }}
                      />
                      {activeEllipsis === notification.id && (
                        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-blue-500 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsUnread(notification.id);
                              setActiveEllipsis(null);
                            }}
                          >
                            Mark as Unread
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNotification(notification.id);
                              setActiveEllipsis(null);
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
