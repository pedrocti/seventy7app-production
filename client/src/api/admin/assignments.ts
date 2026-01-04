import axios from "axios";
import { API_BASE } from "@/api/http";
import { Assignment } from "@/types/admin";

const headers = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

export const getAssignments = async (token: string, courseId: number): Promise<Assignment[]> => {
  const res = await axios.get(`${API_BASE}/admin/learning/courses/${courseId}/assignments`, { headers: headers(token) });
  return res.data.assignments || [];
};

export const addAssignment = async (token: string, courseId: number, assignment: Partial<Assignment>): Promise<Assignment> => {
  const res = await axios.post(`${API_BASE}/admin/learning/courses/${courseId}/assignments`, assignment, { headers: headers(token) });
  return res.data.assignment;
};

export const updateAssignment = async (token: string, courseId: number, assignmentId: number, assignment: Partial<Assignment>) => {
  await axios.patch(`${API_BASE}/admin/learning/courses/${courseId}/assignments/${assignmentId}`, assignment, { headers: headers(token) });
};

export const deleteAssignment = async (token: string, courseId: number, assignmentId: number) => {
  await axios.delete(`${API_BASE}/admin/learning/courses/${courseId}/assignments/${assignmentId}`, { headers: headers(token) });
};
