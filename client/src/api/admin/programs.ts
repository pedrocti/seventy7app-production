import axios from "axios";
import { API_BASE } from "@/api/http";
import { Program } from "@/types/admin";

export const ProgramsAPI = {
  /* =========================
     GET ALL PROGRAMS
     ========================= */
  getPrograms: async (token: string): Promise<Program[]> => {
    const res = await axios.get(`${API_BASE}/admin/learning/programs`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // ✅ Backend returns { success, data }
    return res.data.data ?? [];
  },

  /* =========================
     CREATE PROGRAM
     ========================= */
  createProgram: async (
    token: string,
    data: {
      title: string;
      description?: string; // ✅ ADD (optional, safe)
      price: number;
      duration_days: number;
    }
  ): Promise<Program> => {
    const res = await axios.post(
      `${API_BASE}/admin/learning/programs`,
      data,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    // ✅ Backend returns { success, data }
    return res.data.data;
  },

  /* =========================
     DELETE PROGRAM
     ========================= */
  deleteProgram: async (
    token: string,
    programId: number
  ): Promise<void> => {
    await axios.delete(
      `${API_BASE}/admin/learning/programs/${programId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  },
};
