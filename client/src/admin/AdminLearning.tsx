// client/src/admin/AdminLearning.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/api/http";
import { useAuth } from "@/auth/AuthContext";

type Course = { id: number; title: string; description?: string; is_active?: boolean; created_at?: string };
type Enrollment = { id: number; user_id: number; course_id: number; status: string; enrolled_at: string };
type Lesson = { id: number; title: string; content?: string; material_link?: string; pdf_url?: string; sort_order?: number; created_at?: string };
type Assignment = { id: number; title: string; description?: string; due_date?: string; created_at?: string };

export default function AdminLearning() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");

  // Manage full-page view state
  const [managingCourse, setManagingCourse] = useState<Course | null>(null);

  // Course-specific data
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  // Forms for add
  const [lessonForm, setLessonForm] = useState({ title: "", content: "", material_link: "", pdf_url: "" });
  const [assignmentForm, setAssignmentForm] = useState({ title: "", description: "", due_date: "" }); // due_date as YYYY-MM-DD

  // Editing states
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editingLessonDraft, setEditingLessonDraft] = useState<Partial<Lesson> | null>(null);

  const [editingAssignmentId, setEditingAssignmentId] = useState<number | null>(null);
  const [editingAssignmentDraft, setEditingAssignmentDraft] = useState<Partial<Assignment> | null>(null);

  const [managingLoading, setManagingLoading] = useState(false);
  const [managingError, setManagingError] = useState<string | null>(null);

  // Load courses + enrollments
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [cRes, eRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/learning/courses`, { headers }),
        axios.get(`${API_BASE}/admin/learning/enrollments`, { headers }),
      ]);
      setCourses(cRes.data.courses || []);
      setEnrollments(eRes.data.enrollments || []);
    } catch (err: any) {
      console.error("Load error", err);
      setError(err?.response?.data?.error || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Create course
  const createCourse = async () => {
    if (!title.trim()) return setError("Course title required");
    setCreating(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/admin/learning/courses`, { title: title.trim(), description: "" }, { headers });
      setCourses((prev) => [...prev, res.data.course]);
      setTitle("");
    } catch (err: any) {
      console.error("Create course error", err);
      setError(err?.response?.data?.error || "Failed to create course");
    } finally {
      setCreating(false);
    }
  };

  // Open Manage (full page) and load lessons & assignments
  const openManage = async (course: Course) => {
    setManagingCourse(course);
    setManagingLoading(true);
    setManagingError(null);

    try {
      const [lRes, aRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/learning/courses/${course.id}/lessons`, { headers }),
        axios.get(`${API_BASE}/admin/learning/courses/${course.id}/assignments`, { headers }),
      ]);
      // ensure arrays
      setLessons(lRes.data.lessons || []);
      setAssignments(aRes.data.assignments || []);
      // clear forms/editing
      setLessonForm({ title: "", content: "", material_link: "", pdf_url: "" });
      setAssignmentForm({ title: "", description: "", due_date: "" });
      setEditingLessonId(null);
      setEditingAssignmentId(null);
      setEditingLessonDraft(null);
      setEditingAssignmentDraft(null);
    } catch (err: any) {
      console.error("Manage load error", err);
      setManagingError(err?.response?.data?.error || "Failed to load course details");
    } finally {
      setManagingLoading(false);
    }
  };

  // Convert YYYY-MM-DD (from <input type="date">) to ISO or null
  function dateInputToISO(dateStr: string | undefined | null) {
    if (!dateStr) return null;
    // If already ISO-ish, try to parse
    // dateStr expected in YYYY-MM-DD
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  }

  // -----------------------
  // LESSONS: add / update / delete
  // -----------------------
  const addLesson = async () => {
    if (!managingCourse) return;
    if (!lessonForm.title.trim()) return setManagingError("Lesson title required");
    setManagingLoading(true);
    setManagingError(null);
    try {
      const res = await axios.post(
        `${API_BASE}/admin/learning/courses/${managingCourse.id}/lessons`,
        { ...lessonForm, sort_order: lessons.length + 1 },
        { headers }
      );
      setLessons((s) => [...s, res.data.lesson]);
      setLessonForm({ title: "", content: "", material_link: "", pdf_url: "" });
    } catch (err: any) {
      console.error("Add lesson error", err);
      setManagingError(err?.response?.data?.error || "Failed to add lesson");
    } finally {
      setManagingLoading(false);
    }
  };

  const startEditLesson = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setEditingLessonDraft({ ...lesson });
  };

  const cancelEditLesson = () => {
    setEditingLessonId(null);
    setEditingLessonDraft(null);
  };

  const saveEditLesson = async () => {
    if (!managingCourse || !editingLessonId || !editingLessonDraft) return;
    setManagingLoading(true);
    try {
      const payload = {
        title: editingLessonDraft.title,
        content: editingLessonDraft.content,
        material_link: editingLessonDraft.material_link,
        pdf_url: editingLessonDraft.pdf_url,
        sort_order: editingLessonDraft.sort_order ?? 0,
      };
      await axios.patch(
        `${API_BASE}/admin/learning/courses/${managingCourse.id}/lessons/${editingLessonId}`,
        payload,
        { headers }
      );
      setLessons((prev) => prev.map((l) => (l.id === editingLessonId ? ({ ...l, ...payload } as Lesson) : l)));
      cancelEditLesson();
    } catch (err) {
      console.error("Update lesson error", err);
      alert("Failed to update lesson");
    } finally {
      setManagingLoading(false);
    }
  };

  const deleteLesson = async (lessonId: number) => {
    if (!managingCourse) return;
    if (!confirm("Delete this lesson?")) return;
    setManagingLoading(true);
    try {
      await axios.delete(
        `${API_BASE}/admin/learning/courses/${managingCourse.id}/lessons/${lessonId}`,
        { headers }
      );

    } catch (err) {
      console.error("Delete lesson error", err);
      alert("Failed to delete lesson");
    } finally {
      setManagingLoading(false);
    }
  };

  // -----------------------
  // ASSIGNMENTS: add / update / delete
  // -----------------------
  const addAssignment = async () => {
    if (!managingCourse) return;
    if (!assignmentForm.title.trim()) return setManagingError("Assignment title required");
    setManagingLoading(true);
    setManagingError(null);

    const payload = {
      title: assignmentForm.title.trim(),
      description: assignmentForm.description?.trim() || "",
      due_date: dateInputToISO(assignmentForm.due_date) // null if empty
    };

    try {
      const res = await axios.post(
        `${API_BASE}/admin/learning/courses/${managingCourse.id}/assignments`,
        payload,
        { headers }
      );
      setAssignments((s) => [...s, res.data.assignment]);
      setAssignmentForm({ title: "", description: "", due_date: "" });
    } catch (err: any) {
      console.error("Add assignment error", err);
      setManagingError(err?.response?.data?.error || "Failed to add assignment");
    } finally {
      setManagingLoading(false);
    }
  };

  const startEditAssignment = (a: Assignment) => {
    setEditingAssignmentId(a.id);
    // Normalize due_date to YYYY-MM-DD for date input if present
    const due = a.due_date ? (a.due_date.slice(0, 10)) : "";
    setEditingAssignmentDraft({ ...a, due_date: due });
  };

  const cancelEditAssignment = () => {
    setEditingAssignmentId(null);
    setEditingAssignmentDraft(null);
  };

  const saveEditAssignment = async () => {
    if (!managingCourse || !editingAssignmentId || !editingAssignmentDraft) return;
    setManagingLoading(true);
    try {
      const payload: any = {
        title: editingAssignmentDraft.title,
        description: editingAssignmentDraft.description ?? ""
      };
      // due_date may be empty string or YYYY-MM-DD
      payload.due_date = editingAssignmentDraft.due_date ? dateInputToISO(editingAssignmentDraft.due_date as string) : null;

      await axios.patch(
        `${API_BASE}/admin/learning/courses/${managingCourse.id}/assignments/${editingAssignmentId}`,
        payload,
        { headers }
      );


      setAssignments((prev) => prev.map((p) => (p.id === editingAssignmentId ? ({ ...p, ...payload } as Assignment) : p)));
      cancelEditAssignment();
    } catch (err) {
      console.error("Update assignment error", err);
      alert("Failed to update assignment");
    } finally {
      setManagingLoading(false);
    }
  };

  const deleteAssignment = async (assignmentId: number) => {
    if (!managingCourse) return;
    if (!confirm("Delete this assignment?")) return;
    setManagingLoading(true);
    try {
      await axios.delete(
        `${API_BASE}/admin/learning/courses/${managingCourse.id}/assignments/${assignmentId}`,
        { headers }
      );

      setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    } catch (err) {
      console.error("Delete assignment error", err);
      alert("Failed to delete assignment");
    } finally {
      setManagingLoading(false);
    }
  };

  // Close manage page and clear states
  const closeManage = () => {
    setManagingCourse(null);
    setLessons([]);
    setAssignments([]);
    setAssignmentForm({ title: "", description: "", due_date: "" });
    setLessonForm({ title: "", content: "", material_link: "", pdf_url: "" });
    setEditingLessonId(null);
    setEditingLessonDraft(null);
    setEditingAssignmentId(null);
    setEditingAssignmentDraft(null);
  };

  if (loading) return <div className="p-6">Loading learning admin...</div>;

  // If managingCourse is selected, show full-page manage UI
  if (managingCourse) {
    return (
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <button onClick={closeManage} className="px-3 py-1 rounded bg-gray-700 text-white mr-3">← Back</button>
            <h2 className="text-2xl font-bold inline-block">{managingCourse.title}</h2>
            <div className="text-sm text-gray-400">{managingCourse.description}</div>
          </div>
          <div>
            {managingLoading && <div className="text-sm text-gray-400">Saving...</div>}
            {managingError && <div className="text-sm text-red-400">{managingError}</div>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* LESSONS COLUMN */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Lessons ({lessons.length})</h3>

            {/* LIST */}
            <div className="space-y-3 mb-4">
              {lessons.length === 0 && <div className="text-gray-400">No lessons yet.</div>}
              {lessons.map((l) => (
                <div key={l.id} className="p-3 bg-[#071029] rounded border border-[#0F172A]">
                  {editingLessonId === l.id && editingLessonDraft ? (
                    <div className="space-y-2">
                      <input className="w-full p-2 bg-[#0F172A] rounded" value={editingLessonDraft.title || ""} onChange={(e) => setEditingLessonDraft({ ...editingLessonDraft, title: e.target.value })} />
                      <textarea className="w-full p-2 bg-[#0F172A] rounded" value={editingLessonDraft.content || ""} onChange={(e) => setEditingLessonDraft({ ...editingLessonDraft, content: e.target.value })} />
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-[#0AEFFF] rounded text-black" onClick={saveEditLesson}>Save</button>
                        <button className="px-3 py-1 bg-gray-600 rounded" onClick={cancelEditLesson}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium">{l.title}</div>
                      <div className="text-xs text-gray-400 my-1">{l.content?.slice(0, 120)}</div>
                      <div className="flex gap-2 mt-2">
                        <button className="px-2 py-1 bg-blue-400 rounded text-black" onClick={() => startEditLesson(l)}>Edit</button>
                        <button className="px-2 py-1 bg-red-500 rounded text-black" onClick={() => deleteLesson(l.id)}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ADD LESSON */}
            <div className="p-3 bg-[#081022] rounded border border-[#0F172A]">
              <h4 className="font-semibold mb-2">Add Lesson</h4>
              <input className="w-full p-2 bg-[#0F172A] rounded mb-2" placeholder="Lesson title" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} />
              <input className="w-full p-2 bg-[#0F172A] rounded mb-2" placeholder="Material link (optional)" value={lessonForm.material_link} onChange={(e) => setLessonForm({ ...lessonForm, material_link: e.target.value })} />
              <input className="w-full p-2 bg-[#0F172A] rounded mb-2" placeholder="PDF URL (optional)" value={lessonForm.pdf_url} onChange={(e) => setLessonForm({ ...lessonForm, pdf_url: e.target.value })} />
              <textarea className="w-full p-2 bg-[#0F172A] rounded mb-2" placeholder="Short content" value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} />
              <button className="px-3 py-1 bg-[#0AEFFF] rounded text-black" onClick={addLesson}>Add Lesson</button>
            </div>
          </div>

          {/* ASSIGNMENTS COLUMN */}
          <div>
            <h3 className="text-xl font-semibold mb-3">Assignments ({assignments.length})</h3>

            {/* LIST */}
            <div className="space-y-3 mb-4">
              {assignments.length === 0 && <div className="text-gray-400">No assignments yet.</div>}
              {assignments.map(a => (
                <div key={a.id} className="p-3 bg-[#071029] rounded border border-[#0F172A]">
                  {editingAssignmentId === a.id && editingAssignmentDraft ? (
                    <div className="space-y-2">
                      <input className="w-full p-2 bg-[#0F172A] rounded" value={editingAssignmentDraft.title || ""} onChange={(e) => setEditingAssignmentDraft({ ...editingAssignmentDraft, title: e.target.value })} />
                      <textarea className="w-full p-2 bg-[#0F172A] rounded" value={editingAssignmentDraft.description || ""} onChange={(e) => setEditingAssignmentDraft({ ...editingAssignmentDraft, description: e.target.value })} />
                      <input className="w-full p-2 bg-[#0F172A] rounded" type="date" value={(editingAssignmentDraft.due_date as string) || ""} onChange={(e) => setEditingAssignmentDraft({ ...editingAssignmentDraft, due_date: e.target.value })} />
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-[#0AEFFF] rounded text-black" onClick={saveEditAssignment}>Save</button>
                        <button className="px-3 py-1 bg-gray-600 rounded" onClick={cancelEditAssignment}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-medium">{a.title}</div>
                      <div className="text-xs text-gray-400">{a.description}</div>
                      <div className="text-xs text-gray-500 mt-1">Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : "No due date"}</div>
                      <div className="flex gap-2 mt-2">
                        <button className="px-2 py-1 bg-blue-400 rounded text-black" onClick={() => startEditAssignment(a)}>Edit</button>
                        <button className="px-2 py-1 bg-red-500 rounded text-black" onClick={() => deleteAssignment(a.id)}>Delete</button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* ADD ASSIGNMENT */}
            <div className="p-3 bg-[#081022] rounded border border-[#0F172A]">
              <h4 className="font-semibold mb-2">Add Assignment</h4>
              <input className="w-full p-2 bg-[#0F172A] rounded mb-2" placeholder="Assignment title" value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} />
              <textarea className="w-full p-2 bg-[#0F172A] rounded mb-2" placeholder="Description" value={assignmentForm.description} onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })} />
              <input className="w-full p-2 bg-[#0F172A] rounded mb-2" type="date" value={assignmentForm.due_date} onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })} />
              <button className="px-3 py-1 bg-[#0AEFFF] rounded text-black" onClick={addAssignment}>Add Assignment</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default index view (courses + enrollments)
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 items-start">
        <input className="p-2 rounded bg-[#0F172A] flex-1" placeholder="New course title" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button onClick={createCourse} disabled={creating} className={`px-4 py-2 rounded text-black ${creating ? "bg-gray-500 cursor-not-allowed" : "bg-[#0AEFFF]"}`}>
          {creating ? "Creating..." : "Create Course"}
        </button>
      </div>

      {error && <div className="text-red-400">{error}</div>}

      <div>
        <h3 className="text-lg font-bold mb-2">Courses ({courses.length})</h3>
        {courses.length === 0 ? (
          <div className="text-gray-400">No courses yet.</div>
        ) : (
          <ul className="space-y-2">
            {courses.map((c) => (
              <li key={c.id} className="p-3 bg-[#071029] rounded border border-[#0F172A] flex flex-col sm:flex-row justify-between">
                <div>
                  <div className="font-semibold">{c.title}</div>
                  <div className="text-sm text-gray-400">{c.description || "No description"}</div>
                  <div className="text-xs text-gray-500">{c.created_at ? new Date(c.created_at).toLocaleString() : ""}</div>
                </div>
                <div className="mt-3 sm:mt-0">
                  <button onClick={() => openManage(c)} className="px-3 py-1 bg-[#0AEFFF] text-black rounded">Manage</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div>
        <h3 className="text-lg font-bold mb-2">Enrollments ({enrollments.length})</h3>
        {enrollments.length === 0 ? (
          <div className="text-gray-400">No enrollments yet.</div>
        ) : (
          <ul className="space-y-2">
            {enrollments.map((e) => (
              <li key={e.id} className="p-3 bg-[#071029] rounded border border-[#0F172A]">
                <div>User #{e.user_id} — Course #{e.course_id} — {e.status}</div>
                <div className="text-xs text-gray-500">{new Date(e.enrolled_at).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
