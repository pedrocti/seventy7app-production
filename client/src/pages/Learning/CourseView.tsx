// CourseView.tsx
import React, { useEffect, useState } from "react";
import { useAuth } from "@/auth/AuthContext";
import { LearningAPI } from "@/api/learning";
import LessonsList from "./LessonsList";
import AssignmentsList from "./AssignmentsList";
import SubmitModal from "./SubmitModal";
import { toast } from "sonner";

// Full Assignment interface including submission details
interface Assignment {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  my_submission?: {
    submitted_at: string;
    content?: string;
    status?: "pending" | "graded" | "rejected";
    grade?: number | null;
    feedback?: string;
    graded_at?: string; // Crucial for detecting new grades
  };
}

interface Lesson {
  id: number;
  title: string;
  content?: string;
  video_url?: string | null;
  pdf_url?: string | null;
  external_link?: string | null;
  completed?: boolean;
}

interface Course {
  id: number;
  title: string;
  description?: string;
}

interface Props {
  courseId: number;
  onBack?: () => void;
}

export default function CourseView({ courseId, onBack }: Props) {
  const { token: authToken } = useAuth();
  const token = authToken || localStorage.getItem("token") || "";

  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Key for storing last visit timestamp per course
  const LAST_VISIT_KEY = `course_${courseId}_last_visit`;

  useEffect(() => {
    if (!token) {
      setError("Please log in to access this course.");
      setLoading(false);
      return;
    }
    loadCourseData();
  }, [courseId, token]);

  const loadCourseData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch course + lessons
      const response = await LearningAPI.getSingleCourse(courseId);
      const fetchedCourse = response.course;
      const fetchedLessons = response.lessons || [];

      if (!fetchedCourse) throw new Error("Course not found");

      setCourse(fetchedCourse);
      setLessons(fetchedLessons);

      // 2. Fetch detailed assignments WITH user submissions (grades, status, etc.)
      const assignmentsRes = await fetch(`/api/learning/assignments/with-submission/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!assignmentsRes.ok) throw new Error("Failed to load assignments");
      const assignmentsData = await assignmentsRes.json();

      if (assignmentsData.success) {
        setAssignments(assignmentsData.assignments);
      } else {
        setAssignments([]);
      }

      // 3. Fetch lesson progress to mark completed lessons
      const progressRes = await fetch(`/api/learning/progress/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const progressJson = await progressRes.json();

      if (progressJson.success) {
        const completedLessonIds = progressJson.lessons_completed.map((l: any) => l.lesson_id);
        const updatedLessons = fetchedLessons.map((lesson: Lesson) => ({
          ...lesson,
          completed: completedLessonIds.includes(lesson.id),
        }));
        setLessons(updatedLessons);

        const percent = fetchedLessons.length
          ? Math.round((completedLessonIds.length / fetchedLessons.length) * 100)
          : 0;
        setProgressPercent(percent);
      }
    } catch (err: any) {
      console.error("Course load error:", err);
      setError(err.message || "Failed to load course content.");
    } finally {
      setLoading(false);
    }
  };

  // Grading Notification: Show toast when a new grade appears
  useEffect(() => {
    if (loading || assignments.length === 0) return;

    const lastVisit = localStorage.getItem(LAST_VISIT_KEY);
    const now = Date.now();
    localStorage.setItem(LAST_VISIT_KEY, now.toString()); // Update visit time

    const newlyGraded = assignments.filter((a) => {
      const sub = a.my_submission;
      if (!sub || sub.status !== "graded" || !sub.graded_at) return false;

      const gradedTime = new Date(sub.graded_at).getTime();
      return !lastVisit || gradedTime > parseInt(lastVisit);
    });

    newlyGraded.forEach((assignment) => {
      const sub = assignment.my_submission!;
      toast.success(
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-lg">Assignment Graded!</p>
            <p className="text-sm opacity-90">"{assignment.title}"</p>
            <p className="text-2xl font-bold text-[#0AEFFF] mt-1">{sub.grade}%</p>
            {sub.feedback && <p className="text-xs mt-1 opacity-80">Feedback available</p>}
          </div>
        </div>,
        {
          duration: 10000,
          position: "top-center",
        }
      );
    });
  }, [assignments, loading]);

  // Keep your existing handleMarkComplete if you have one — otherwise remove
  // (You had a placeholder — leaving it commented if needed later)
  // const handleMarkComplete = async (lessonId: number) => { ... };

  if (loading) {
    return <div className="p-8 text-center text-gray-400">Loading course...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-400">{error}</div>;
  }

  return (
    <div className="w-full px-2 py-2 space-y-6">
      


      <h2 className="text-2xl font-bold text-white">{course?.title}</h2>
      {course?.description && (
        <p className="text-gray-300 leading-relaxed">{course.description}</p>
      )}

      <LessonsList
        lessons={lessons}
        progressPercent={progressPercent}
        // onMarkComplete={handleMarkComplete} // Uncomment if you implement it
      />

      <AssignmentsList
        assignments={assignments}
        onSubmitClick={setSelectedAssignment}
      />

      {selectedAssignment && (
        <SubmitModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onSubmitted={() => {
            loadCourseData(); // Refresh to show updated status/grade
            setSelectedAssignment(null);
          }}
        />
      )}
    </div>
  );
}