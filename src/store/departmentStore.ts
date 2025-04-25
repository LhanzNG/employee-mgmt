import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Department } from "../types/department";

interface DepartmentStore {
  departments: Department[];
  isLoading: boolean;
  error: string | null;
  fetchDepartments: () => Promise<void>;
  addDepartment: (
    department: Omit<Department, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateDepartment: (
    id: number,
    department: Partial<Department>
  ) => Promise<void>;
  deleteDepartment: (id: number) => Promise<void>;
}

export const useDepartmentStore = create<DepartmentStore>((set) => ({
  departments: [],
  isLoading: false,
  error: null,

  fetchDepartments: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      set({ departments: data as Department[] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  addDepartment: async (department) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("departments")
        .insert([department])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        departments: [...state.departments, data as Department],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateDepartment: async (id, department) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("departments")
        .update(department)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        departments: state.departments.map((dept) =>
          dept.id === id ? { ...dept, ...data } : dept
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteDepartment: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from("departments")
        .delete()
        .eq("id", id);

      if (error) throw error;
      set((state) => ({
        departments: state.departments.filter((dept) => dept.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
