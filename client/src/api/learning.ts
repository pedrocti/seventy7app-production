import axios from "axios";
import { API_BASE } from "./http";

// Helper to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const LearningAPI = {
  // GET all courses (existing)
  getCourses: async () => {
    const res = await axios.get(`${API_BASE}/learning/courses`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  // NEW: GET single course by course ID
  getSingleCourse: async (courseId: number) => {
  const res = await axios.get(`${API_BASE}/learning/courses/${courseId}`, {
    headers: getAuthHeader(),
  });
  return res.data;
},

  // Existing getCourse (by program ID — keep for other uses)
  getCourse: async (programId: number) => {
    const res = await axios.get(`${API_BASE}/learning/programs/${programId}`, {
      headers: getAuthHeader(),
    });
    return res.data;
  },

  enroll: async (course_id: number) => {
    const res = await axios.post(
      `${API_BASE}/learning/enroll`,
      { course_id },
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  getLessons: async (courseId: number) => {
    const res = await axios.get(
      `${API_BASE}/learning/courses/${courseId}/lessons`,
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  getAssignments: async (courseId: number) => {
    const res = await axios.get(
      `${API_BASE}/learning/courses/${courseId}/assignments`,
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  getAssignmentsWithSubmission: async (courseId: number) => {
    const res = await axios.get(
      `${API_BASE}/learning/courses/${courseId}/assignments-with-submission`,
      { headers: getAuthHeader() }
    );
    return res.data;
  },

  submitAssignment: async (assignmentId: number, content: string) => {
    const res = await axios.post(
      `${API_BASE}/learning/assignments/${assignmentId}/submit`,
      { content },
      { headers: getAuthHeader() }
    );
    return res.data;
  },
};