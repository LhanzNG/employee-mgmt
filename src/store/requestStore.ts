import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { EmployeeRequest } from "../types/request";

interface RequestStore {
  requests: EmployeeRequest[];
  isLoading: boolean;
  error: string | null;
  fetchRequests: () => Promise<void>;
  updateRequestStatus: (
    id: string,
    status: "accepted" | "declined",
    reviewerId: string
  ) => Promise<void>;
}

export const useRequestStore = create<RequestStore>((set) => ({
  requests: [],
  isLoading: false,
  error: null,

  fetchRequests: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("employee_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ requests: data as EmployeeRequest[] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateRequestStatus: async (id, status, reviewerId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from("employee_requests")
        .update({
          status,
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewerId,
        })
        .eq("id", id);

      if (error) throw error;

      // Refresh the requests after update
      const { data: updatedData, error: fetchError } = await supabase
        .from("employee_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      set({ requests: updatedData as EmployeeRequest[] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
