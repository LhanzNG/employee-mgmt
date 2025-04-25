import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Document } from "../types/document";

interface DocumentStore {
  documents: Document[];
  isLoading: boolean;
  error: string | null;
  fetchDocumentsByEmployee: (employeeId: number) => Promise<void>;
  deleteDocument: (id: number) => Promise<void>;
}

export const useDocumentStore = create<DocumentStore>((set) => ({
  documents: [],
  isLoading: false,
  error: null,

  fetchDocumentsByEmployee: async (employeeId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("employee_id", employeeId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({ documents: data as Document[] });
    } catch (error) {
      console.error("Error fetching documents:", error);
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteDocument: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.from("documents").delete().eq("id", id);

      if (error) throw error;
      set((state) => ({
        documents: state.documents.filter((doc) => doc.id !== id),
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },
}));
