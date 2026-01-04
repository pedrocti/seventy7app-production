import axios from "axios";
import { API_BASE } from "@/api/http";
import { Lesson } from "@/types/admin";

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

export const getLessons = async (token: string, courseId: number): Promise<Lesson[]> => {
  const res = await axios.get(`${API_BASE}/admin/learning/courses/${courseId}/lessons`, { headers: headers(token) });
  return res.data.lessons || [];
};

export const addLesson = async (token: string, courseId: number, lesson: Partial<Lesson>): Promise<Lesson> => {
  const res = await axios.post(`${API_BASE}/admin/learning/courses/${courseId}/lessons`, lesson, { headers: headers(token) });
  return res.data.lesson;
};

export const updateLesson = async (token: string, courseId: number, lessonId: number, lesson: Partial<Lesson>) => {
  await axios.patch(`${API_BASE}/admin/learning/courses/${courseId}/lessons/${lessonId}`, lesson, { headers: headers(token) });
};

export const deleteLesson = async (token: string, courseId: number, lessonId: number) => {
  await axios.delete(`${API_BASE}/admin/learning/courses/${courseId}/lessons/${lessonId}`, { headers: headers(token) });
};
