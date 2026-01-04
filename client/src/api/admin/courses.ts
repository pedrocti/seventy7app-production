import axios from "axios";
import { API_BASE } from "@/api/http";
import { Course, Enrollment } from "@/types/admin";

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

export const CoursesAPI = {
  getCourses: async (token: string, programId: number): Promise<Course[]> => {
    const res = await axios.get(`${API_BASE}/admin/learning/courses/program/${programId}`, { headers: headers(token) });
    return res.data.courses || [];
  },

  createCourse: async (token: string, title: string, programId: number, description?: string): Promise<Course> => {
    const res = await axios.post(
      `${API_BASE}/admin/learning/courses`,
      { title, program_id: programId, description: description || "" },
      { headers: headers(token) }
    );
    return res.data.course;
  },

  updateCourse: async (token: string, courseId: number, updates: { title?: string; description?: string }): Promise<Course> => {
    const res = await axios.patch(`${API_BASE}/admin/learning/courses/${courseId}`, updates, { headers: headers(token) });
    return res.data.course;
  },

  deleteCourse: async (token: string, courseId: number): Promise<Course> => {
    const res = await axios.delete(`${API_BASE}/admin/learning/courses/${courseId}`, { headers: headers(token) });
    return res.data.course;
  },

  getEnrollments: async (token: string, programId: number): Promise<Enrollment[]> => {
    const res = await axios.get(`${API_BASE}/admin/learning/enrollments/program/${programId}`, { headers: headers(token) });
    return res.data.enrollments || [];
  },
};
