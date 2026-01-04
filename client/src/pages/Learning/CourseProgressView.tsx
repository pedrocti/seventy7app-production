import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/api/http";
import { useAuth } from "@/auth/AuthContext";
import { motion } from "framer-motion";

// Define proper types
interface LessonProgress {
  id: number;
  title: string;
  completed: boolean;
}

interface AssignmentProgress {
  id: number;
  title: string;
  submitted: boolean;
}

interface CourseProgressDetail {
  course: { id: number; title: string };
  lessons: LessonProgress[];
  assignments: AssignmentProgress[];
}

interface Props {
  id: number; // courseId
}

export default function CourseProgressView({ id }: Props) {
  const { token } = useAuth();
  const [data, setData] = useState<CourseProgressDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [markingLessonId, setMarkingLessonId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, [id]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/learning/progress/course/${id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setData(res.data);
    } catch (err: any) {
      console.error("Course progress fetch error:", err);
      setError(
        err.response?.status === 401
          ? "Session expired. Please log in again."
          : err.response?.status === 404
          ? "Course progress not found."
          : "Failed to load course progress."
      );
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId: number) => {
    setMarkingLessonId(lessonId);

    // Optimistic update
    setData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        lessons: prev.lessons.map((l) =>
          l.id === lessonId ? { ...l, completed: true } : l
        ),
      };
    });

    try {
      await axios.post(
        `${API_BASE}/learning/progress/lesson/complete`,
        { lessonId },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      // Refresh from server to confirm
      await load();
    } catch (err: any) {
      console.error("Mark complete failed:", err);
      // Rollback optimistic update on error
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          lessons: prev.lessons.map((l) =>
            l.id === lessonId ? { ...l, completed: false } : l
          ),
        };
      });
      setError("Failed to mark lesson complete. Try again.");
    } finally {
      setMarkingLessonId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-400 flex items-center justify-center min-h-[50vh]">
        Loading course progress...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-400 space-y-4">
        <p>{error}</p>
        <button
          onClick={load}
          className="px-6 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!data) {
    return <div className="p-6 text-white">No progress data available for this course.</div>;
  }

  return (
    <div className="p-6 text-white space-y-8">
      <h1 className="text-3xl font-bold mb-2">{data.course.title}</h1>
      <p className="text-gray-400">Track your progress in this course</p>

      {/* Lessons Section */}
      <div className="bg-[#111] p-6 rounded-xl border border-white/10 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">Lessons</h2>
        {data.lessons.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No lessons in this course yet.</p>
        ) : (
          <div className="space-y-4">
            {data.lessons.map((lesson) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center bg-black/30 p-4 rounded-lg border border-white/5 hover:border-[#0AEFFF]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium">{lesson.title}</span>
                </div>
                {lesson.completed ? (
                  <span className="px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded-full font-medium">
                    Completed ✓
                  </span>
                ) : (
                  <button
                    disabled={markingLessonId === lesson.id}
                    onClick={() => markLessonComplete(lesson.id)}
                    className={`
                      px-5 py-2 text-sm font-medium rounded-md transition
                      bg-blue-600 hover:bg-blue-700
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {markingLessonId === lesson.id ? "Marking..." : "Mark Complete"}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Assignments Section */}
      <div className="bg-[#111] p-6 rounded-xl border border-white/10 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6">Assignments</h2>
        {data.assignments.length === 0 ? (
          <p className="text-gray-400 text-center py-8">No assignments yet.</p>
        ) : (
          <div className="space-y-4">
            {data.assignments.map((assignment) => (
              <motion.div
                key={assignment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center bg-black/30 p-4 rounded-lg border border-white/5 hover:border-[#0AEFFF]/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-medium">{assignment.title}</span>
                </div>
                {assignment.submitted ? (
                  <span className="px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded-full font-medium">
                    Submitted ✓
                  </span>
                ) : (
                  <span className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded-full font-medium">
                    Not Submitted
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}