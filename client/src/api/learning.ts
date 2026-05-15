// client/src/api/learning.ts
// ─────────────────────────────────────────────────────────────────────────────
// All calls go through this module. Token is passed in from AuthContext —
// never read from localStorage here.
// ─────────────────────────────────────────────────────────────────────────────
import axios from "axios";
import { API_BASE } from "./http";

function authHeader(token: string) {
  return { Authorization: `Bearer ${token}` };
}

export const LearningAPI = {
  /* ── Programs ──────────────────────────────────────────────────────────── */
  getPrograms: async (token: string) => {
    const r = await axios.get(`${API_BASE}/learning/programs`, { headers: authHeader(token) });
    return r.data; // { success, programs, purchased }
  },

  getProgram: async (programId: number, token: string) => {
    const r = await axios.get(`${API_BASE}/learning/programs/${programId}`, { headers: authHeader(token) });
    return r.data; // { success, program, courses, enrolled }
  },

  buyProgram: async (programId: number, token: string) => {
    const r = await axios.post(`${API_BASE}/learning/programs/buy/${programId}`, {}, { headers: authHeader(token) });
    return r.data;
  },

  enrollProgram: async (programId: number, token: string) => {
    const r = await axios.post(`${API_BASE}/learning/programs/${programId}/enroll`, {}, { headers: authHeader(token) });
    return r.data;
  },

  /* ── Courses ───────────────────────────────────────────────────────────── */
  getCourse: async (courseId: number, token: string) => {
    const r = await axios.get(`${API_BASE}/learning/courses/${courseId}`, { headers: authHeader(token) });
    return r.data; // { success, course, lessons, assignments }
  },

  enrollCourse: async (courseId: number, token: string) => {
    const r = await axios.post(`${API_BASE}/learning/courses/${courseId}/enroll`, {}, { headers: authHeader(token) });
    return r.data;
  },

  getProgramCourses: async (programId: number, token: string) => {
    const r = await axios.get(`${API_BASE}/learning/programs/${programId}/courses`, { headers: authHeader(token) });
    return r.data;
  },

  /* ── Assignments ───────────────────────────────────────────────────────── */
  getAssignmentsWithSubmission: async (courseId: number, token: string) => {
    // Route: GET /api/learning/assignments/with-submission/:course_id
    const r = await axios.get(`${API_BASE}/learning/assignments/with-submission/${courseId}`, { headers: authHeader(token) });
    return r.data; // { success, assignments }
  },

  submitAssignment: async (assignmentId: number, content: string, token: string) => {
    const r = await axios.post(
      `${API_BASE}/learning/assignments/${assignmentId}/submit`,
      { content },
      { headers: authHeader(token) }
    );
    return r.data;
  },

  /* ── Progress ──────────────────────────────────────────────────────────── */
  getCourseProgress: async (courseId: number, token: string) => {
    // Returns { success, lessons_completed, progress_percent, totals }
    const r = await axios.get(`${API_BASE}/learning/progress/${courseId}`, { headers: authHeader(token) });
    return r.data;
  },

  markLessonComplete: async (lessonId: number, token: string) => {
    const r = await axios.post(
      `${API_BASE}/learning/progress/complete`,
      { lesson_id: lessonId },
      { headers: authHeader(token) }
    );
    return r.data;
  },
};