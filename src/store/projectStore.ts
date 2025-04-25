import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Project } from "../types/project";

interface ProjectStore {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  fetchProjects: () => Promise<void>;
  addProject: (
    project: Omit<Project, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateProject: (id: number, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: number) => Promise<void>;
}

export const useProjectStore = create<ProjectStore>((set) => ({
  projects: [],
  isLoading: false,
  error: null,

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("id", { ascending: true });

      if (error) throw error;
      set({ projects: data as Project[] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  addProject: async (project) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("projects")
        .insert([project])
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        projects: [...state.projects, data as Project],
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  updateProject: async (id, project) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("projects")
        .update(project)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      set((state) => ({
        projects: state.projects.map((proj) =>
          proj.id === id ? { ...proj, ...data } : proj
        ),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteProject: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);

      if (error) throw error;
      set((state) => ({
        projects: state.projects.filter((proj) => proj.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
