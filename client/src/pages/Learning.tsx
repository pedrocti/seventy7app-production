import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/api/http";
import { useAuth } from "@/auth/AuthContext";

interface Course {
  id: number;
  title: string;
  description?: string;
}

interface Lesson {
  id: number;
  title: string;
  content?: string;
  material_link?: string;
  pdf_url?: string;
}

interface Assignment {
  id: number;
  title: string;
  description?: string;
  due_date: string;
}

interface Submission {
  id: number;
  content: string;
  submitted_at: string;
}

export default function Learning() {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Record<number, Submission | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Submission modal
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState("");

  const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

  /* ------------------------- LOAD COURSES ------------------------- */
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${API_BASE}/learning/courses`, { headers });
        setCourses(res.data.courses || []);
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to load courses");
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, [token]);

  /* ------------------------- ENROLL ------------------------- */
  const enroll = async (courseId: number) => {
    try {
      await axios.post(`${API_BASE}/learning/enroll`, { course_id: courseId }, { headers });
      alert("Enrollment successful!");
    } catch (err: any) {
      alert(err?.response?.data?.error || "Enroll failed");
    }
  };

  /* ------------------------- LOAD LESSONS ------------------------- */
  const loadLessons = async (course: Course) => {
    setSelectedCourse(course);
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${API_BASE}/learning/courses/${course.id}/lessons`, { headers });
      setLessons(res.data.lessons || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load lessons");
    } finally {
      setLoading(false);
    }

    await loadAssignments(course.id);
  };

  /* ------------------------- LOAD ASSIGNMENTS + SUBMISSIONS ------------------------- */
  const loadAssignments = async (courseId: number) => {
    try {
      const res = await axios.get(`${API_BASE}/learning/courses/${courseId}/assignments`, { headers });
      const assignments = res.data.assignments || [];
      setAssignments(assignments);

      // Fetch submission status for each assignment
      const submissionMap: Record<number, Submission | null> = {};

      await Promise.all(
        assignments.map(async (a: Assignment) => {
          try {
            const r = await axios.get(
              `${API_BASE}/learning/assignments/${a.id}/submission`,
              { headers }
            );
            submissionMap[a.id] = r.data.submission || null;
          } catch {
            submissionMap[a.id] = null;
          }
        })
      );

      setSubmissions(submissionMap);
    } catch (err) {
      console.error("Failed to load assignments:", err);
    }
  };

  /* ------------------------- SUBMIT ASSIGNMENT ------------------------- */
  const submitAssignment = async () => {
    if (!selectedAssignment) return;

    try {
      await axios.post(
        `${API_BASE}/learning/assignments/${selectedAssignment.id}/submit`,
        { content: submissionText },
        { headers }
      );

      alert("Assignment submitted!");

      // Reload submissions
      await loadAssignments(selectedCourse!.id);

      setSubmissionText("");
      setSelectedAssignment(null);
    } catch (err: any) {
      console.error(err);
      alert("Failed to submit assignment");
    }
  };

  /* ------------------------- UI START ------------------------- */
  if (loading) return <div className="p-6 text-gray-400">Loading...</div>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">77KAPITAL ACADEMY</h1>

      {error && <div className="text-red-500">{error}</div>}

      {/* ------------------------- COURSES LIST ------------------------- */}
      {!selectedCourse && (
        <div className="grid gap-4">
          {courses.length === 0 ? (
            <div className="p-4 text-gray-400 bg-[#071029] rounded border border-[#0F172A]">
              No courses available at this time.
            </div>
          ) : (
            courses.map((c) => (
              <div key={c.id} className="p-4 bg-[#071029] rounded border border-[#0F172A]">
                <div className="font-semibold">{c.title}</div>
                <div className="text-sm text-gray-400">{c.description}</div>

                <div className="mt-2 flex gap-2">
                  <button
                    className="px-3 py-1 bg-[#0AEFFF] text-black rounded"
                    onClick={() => enroll(c.id)}
                  >
                    Enroll
                  </button>

                  <button
                    className="px-3 py-1 bg-[#0AEFFF]/80 text-black rounded"
                    onClick={() => loadLessons(c)}
                  >
                    View Lessons
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ------------------------- LESSONS + ASSIGNMENTS ------------------------- */}
      {selectedCourse && (
        <div>
          <button
            className="px-3 py-1 bg-[#0AEFFF] text-black rounded mb-4"
            onClick={() => setSelectedCourse(null)}
          >
            Back to Courses
          </button>

          <h2 className="text-xl font-bold mb-4">{selectedCourse.title}</h2>

          {/* ------------ LESSONS ------------ */}
          <h3 className="text-lg font-semibold mb-2">Lessons</h3>

          {lessons.length === 0 ? (
            <div className="p-4 text-gray-400 bg-[#071029] rounded border border-[#0F172A]">
              No lessons available for this course.
            </div>
          ) : (
            <ul className="space-y-2 mb-6">
              {lessons.map((l) => (
                <li key={l.id} className="p-3 bg-[#071029] rounded border border-[#0F172A]">
                  <div className="font-semibold">{l.title}</div>
                  {l.content && <div className="text-sm text-gray-400 mt-1">{l.content}</div>}

                  {l.material_link && (
                    <a href={l.material_link} target="_blank" className="text-blue-400 underline block mt-1">
                      Video / Resource
                    </a>
                  )}

                  {l.pdf_url && (
                    <a href={l.pdf_url} target="_blank" className="text-blue-400 underline block mt-1">
                      PDF
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}

          {/* ------------ ASSIGNMENTS ------------ */}
          <h3 className="text-lg font-semibold mb-2">Assignments</h3>

          {assignments.length === 0 ? (
            <div className="p-4 text-gray-400 bg-[#071029] rounded border border-[#0F172A]">
              No assignments yet.
            </div>
          ) : (
            <ul className="space-y-3">
              {assignments.map((a) => {
                const sub = submissions[a.id];

                return (
                  <li key={a.id} className="p-3 bg-[#071029] rounded border border-[#0F172A]">
                    <div className="font-semibold">{a.title}</div>
                    <div className="text-sm text-gray-400">{a.description}</div>

                    <div className="text-xs text-gray-500 mt-1">
                      Due: {new Date(a.due_date).toLocaleDateString()}
                    </div>

                    {/* Submission status */}
                    <div className="mt-2 text-sm">
                      {sub ? (
                        <span className="text-green-400">
                          Submitted on {new Date(sub.submitted_at).toLocaleString()}
                        </span>
                      ) : (
                        <span className="text-yellow-400">Not submitted</span>
                      )}
                    </div>

                    {/* Submit button only if NOT submitted */}
                    {!sub && (
                      <button
                        className="mt-2 px-3 py-1 bg-[#0AEFFF] text-black rounded"
                        onClick={() => setSelectedAssignment(a)}
                      >
                        Submit Assignment
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* ------------------------- SUBMISSION MODAL ------------------------- */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-[#071029] p-6 rounded w-full max-w-lg border border-[#0F172A]">
            <h2 className="text-xl font-bold mb-3 text-white">{selectedAssignment.title}</h2>

            <textarea
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              className="w-full h-40 p-3 rounded bg-[#0F172A] text-white border border-gray-700"
              placeholder="Write your assignment..."
            />

            <div className="mt-4 flex gap-3">
              <button
                onClick={submitAssignment}
                className="px-4 py-2 bg-[#0AEFFF] text-black rounded"
              >
                Submit
              </button>

              <button
                onClick={() => setSelectedAssignment(null)}
                className="px-4 py-2 bg-gray-500 rounded text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
