import React, { useState, useEffect } from "react";
import { LearningAPI } from "@/api/learning";

// Define proper types
interface Course {
  id: number;
  title: string;
  description: string | null;
  enrolled: boolean;
  // Add more fields if your API returns them (e.g. progress, lessonsCount)
}

// Single, consistent props interface
interface CoursesProps {
  programId: number;
  onBack: () => void;
  onSelectCourse: (courseId: number) => void;
  courses?: Course[] | undefined; // optional — parent can pass or we fetch
  refresh?: () => void;
  headers?: Record<string, string>;
}

export default function Courses({
  programId,
  onBack,
  onSelectCourse,
  courses: propCourses = [],
  refresh,
  headers = {},
}: CoursesProps) {
  const [localCourses, setLocalCourses] = useState<Course[]>(propCourses);
  const [loading, setLoading] = useState(propCourses.length === 0); // only load if no prop passed
  const [error, setError] = useState<string | null>(null);
  const [loadingCourseId, setLoadingCourseId] = useState<number | null>(null);

  // Fetch courses if parent didn't pass them (self-contained mode)
  useEffect(() => {
    if (propCourses.length > 0) {
      setLocalCourses(propCourses);
      setLoading(false);
      return;
    }

    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        // Adjust to your actual API endpoint and response shape
        const token = localStorage.getItem("token");
        const res = await fetch(`/api/learning/programs/${programId}`, {
          headers: {
            ...headers,
            Authorization: token ? `Bearer ${token}` : "",
          },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();

        if (!data.success) throw new Error(data.error || "Failed to load courses");

        const fetched = data.courses || [];
        setLocalCourses(fetched);
      } catch (err: any) {
        console.error("Courses fetch error:", err);
        setError(err.message || "Could not load courses. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [programId, propCourses.length, headers]);

  const handleEnroll = async (courseId: number) => {
    if (loadingCourseId !== null) return;
    setLoadingCourseId(courseId);

    try {
      await LearningAPI.enroll(courseId, headers);
      refresh?.(); // parent refresh if provided

      // Optimistic update
      setLocalCourses((prev) =>
        prev.map((c) =>
          c.id === courseId ? { ...c, enrolled: true } : c
        )
      );
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.error ||
        (err?.response?.status === 409
          ? "You are already enrolled in this course."
          : "Failed to enroll. Please try again.");
      alert(errorMessage);
    } finally {
      setLoadingCourseId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400">
        Loading courses...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-400">
        {error}
        <button
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
        >
          Back
        </button>
      </div>
    );
  }

  const displayCourses = localCourses;

  return (
    <div className="space-y-6 p-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition"
      >
        ← Back to Program
      </button>

      <h2 className="text-2xl font-bold text-white">Courses in this Program</h2>

      {displayCourses.length === 0 ? (
        <div className="p-6 text-center text-gray-400 bg-[#071029] rounded-lg border border-[#0F172A]">
          No courses available in this program.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {displayCourses.map((course) => (
            <div
              key={course.id}
              className="p-5 bg-[#071029] rounded-lg border border-[#0F172A] hover:border-[#0AEFFF]/50 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-white text-lg">{course.title}</h3>
                {course.enrolled && (
                  <span className="text-xs px-2.5 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-400/40 font-medium">
                    Enrolled ✓
                  </span>
                )}
              </div>

              {course.description && (
                <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                  {course.description}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                {!course.enrolled ? (
                  <button
                    className={`
                      px-4 py-2 rounded-md font-medium text-sm
                      bg-[#0AEFFF] text-black
                      hover:bg-[#00d4ff] active:bg-[#00bfff]
                      disabled:opacity-50 disabled:cursor-not-allowed
                      transition-colors
                    `}
                    disabled={loadingCourseId === course.id}
                    onClick={() => handleEnroll(course.id)}
                  >
                    {loadingCourseId === course.id ? "Enrolling..." : "Enroll Now"}
                  </button>
                ) : (
                  <button
                    className="px-4 py-2 rounded-md font-medium text-sm bg-gray-700 text-gray-300 cursor-not-allowed opacity-70"
                    disabled
                  >
                    Already Enrolled
                  </button>
                )}

                <button
                  className={`
                    px-4 py-2 rounded-md font-medium text-sm
                    bg-[#0AEFFF]/80 text-black
                    hover:bg-[#00d4ff]/80
                    transition-colors
                  `}
                  onClick={() => onSelectCourse(course.id)}
                >
                  View Lessons
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}