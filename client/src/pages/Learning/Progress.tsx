// Progress.tsx (or UserProgress.tsx)
import React, { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter"; // add back if you use links
import { motion } from "framer-motion";
import axios from "axios";
import { API_BASE } from "@/api/http";

// Define proper types
interface CourseProgress {
  id: number;
  title: string;
  percentage: number;
  completedLessons: number;
  totalLessons: number;
  completedAssignments: number;
  totalAssignments: number;
}

interface ProgressProps {
  courseId?: number;
  onBack?: () => void;
}

export default function Progress({ courseId, onBack }: ProgressProps) {
  const { token } = useAuth();
  const [data, setData] = useState<CourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setError("Please log in to view progress.");
        setLoading(false);
        return;
      }

      try {
        const url = courseId
          ? `${API_BASE}/learning/progress/${courseId}` // single course if id passed
          : `${API_BASE}/learning/progress/courses`; // all courses

        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const courses = courseId ? [res.data] : res.data.courses || [];
        setData(courses);
      } catch (err: any) {
        console.error("Progress load error:", err);
        setError(err.response?.data?.error || "Failed to load progress. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [token, courseId]);

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-400">
        Loading your progress...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-400">
        {error}
        <button
          onClick={() => {
            setError(null);
            setLoading(true);
          }}
          className="ml-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          Retry
        </button>
        {onBack && (
          <button
            onClick={onBack}
            className="ml-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-500"
          >
            Back
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6 text-white space-y-6">
      {/* Back button if provided */}
      {onBack && (
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition mb-4"
        >
          ← Back
        </button>
      )}

      <h1 className="text-3xl font-bold mb-6">Your Learning Progress</h1>

      {data.length === 0 ? (
        <div className="text-center text-gray-400 py-12">
          <p className="text-lg">No courses started yet.</p>
          <Link
            to="/learning"
            className="text-[#0AEFFF] hover:underline mt-4 inline-block"
          >
            Browse programs →
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((course) => {
            const percentage = course.percentage || 0;
            return (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-[#111] p-6 rounded-xl border border-white/10 shadow-lg hover:shadow-[#0AEFFF]/20 transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold">{course.title}</h2>
                  <Link
                    to={`/learning/course-progress/${course.id}`}
                    className="text-sm text-[#0AEFFF] hover:underline"
                  >
                    Details →
                  </Link>
                </div>

                <p className="text-sm text-gray-400 mb-3">
                  Lessons: {course.completedLessons}/{course.totalLessons} • Assignments: {course.completedAssignments}/{course.totalAssignments}
                </p>

                <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#0AEFFF] to-cyan-400"
                  />
                </div>

                <p className="text-right text-sm text-gray-400 mt-1">
                  {percentage}% complete
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}