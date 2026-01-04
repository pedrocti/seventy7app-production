import React, { useEffect, useState } from "react";
import { Course, Lesson, Assignment } from "@/types/admin";
import { LessonsAPI, AssignmentsAPI } from "@/api/admin";
import LessonsColumn from "./LessonsColumn";
import AssignmentsColumn from "./AssignmentsColumn";

type Props = {
  course: Course;
  token: string;
  onClose: () => void;
};

export default function CourseManage({ course, token, onClose }: Props) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCourseData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [l, a] = await Promise.all([
        LessonsAPI.getLessons(token, course.id),
        AssignmentsAPI.getAssignments(token, course.id),
      ]);
      setLessons(l);
      setAssignments(a);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load course details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, [course]);

  if (loading) return <div className="p-6">Loading course details...</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <button onClick={onClose} className="px-3 py-1 rounded bg-gray-700 text-white mr-3">← Back</button>
          <h2 className="text-2xl font-bold inline-block">{course.title}</h2>
          <div className="text-sm text-gray-400">{course.description}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <LessonsColumn lessons={lessons} setLessons={setLessons} courseId={course.id} token={token} />
        <AssignmentsColumn assignments={assignments} setAssignments={setAssignments} courseId={course.id} token={token} />
      </div>
    </div>
  );
}
