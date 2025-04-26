import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Employee } from "../types/employee";

interface Notification {
  id: number;
  message: string;
  type: string;
  link: string;
  isRead: boolean;
  timestamp: string; // Added timestamp property
}

interface EmployeeStore {
  employees: Employee[];
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
  fetchEmployees: () => Promise<void>;
  addEmployee: (
    employee: Omit<Employee, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateEmployee: (id: number, employee: Partial<Employee>) => Promise<void>;
  deleteEmployee: (id: number) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  markNotificationAsRead: (id: number) => void;
}

export const useEmployeeStore = create<EmployeeStore>((set) => ({
  employees: [],
  isLoading: false,
  error: null,
  notifications: [],

  fetchEmployees: async () => {
    set({ isLoading: true, error: null });
    try {
      let { data: employees, error } = await supabase
        .from("employees")
        .select(
          `
          *,
          departments (
            name
          ),
          projects (
            name
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ employees: employees as Employee[] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  addEmployee: async (employee) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("employees")
        .insert([employee])
        .select(
          `
          *,
          departments (
            name
          )
        `
        )
        .single();

      if (error) throw error;

      set((state) => ({
        employees: [data as Employee, ...state.employees],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateEmployee: async (id, employee) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("employees")
        .update(employee)
        .eq("id", id)
        .select(
          `
          *,
          departments (
            name
          )
        `
        )
        .single();

      if (error) throw error;

      set((state) => ({
        employees: state.employees.map((emp) =>
          emp.id === id ? { ...emp, ...data } : emp
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteEmployee: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from("employees").delete().eq("id", id);

      if (error) throw error;

      set((state) => ({
        employees: state.employees.filter((emp) => emp.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  fetchNotifications: async () => {
    try {
      // Check if notifications exist in localStorage
      const storedNotifications = localStorage.getItem("notifications");
      if (storedNotifications) {
        set({ notifications: JSON.parse(storedNotifications) });
        return;
      }

      // Simulate fetching notifications from an API or database
      const mockNotifications: Notification[] = [
        {
          id: 1,
          message: "Pending leave request",
          type: "request",
          link: "/employees/requests",
          isRead: false,
          timestamp: "2025-04-22T10:00:00Z",
        },
        {
          id: 2,
          message: "New project assigned",
          type: "info",
          link: "/projects",
          isRead: false,
          timestamp: "2025-04-21T15:30:00Z",
        },
      ];

      // Persist the fetched notifications to localStorage
      localStorage.setItem("notifications", JSON.stringify(mockNotifications));

      set({ notifications: mockNotifications });
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  },

  markNotificationAsRead: (id) => {
    set((state) => {
      const updatedNotifications = state.notifications.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      );

      // Persist the updated notifications to localStorage
      localStorage.setItem(
        "notifications",
        JSON.stringify(updatedNotifications)
      );

      return { notifications: updatedNotifications };
    });
  },
}));
