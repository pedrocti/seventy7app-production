import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Edit2, Trash2, User, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Lesson {
  id: number;
  title: string;
  course_id: number;
}

interface Assignment {
  assignment_id: number;
  course_id: number;
  title: string;
  description: string;
  due_date: string | null;
  created_at: string;
}

interface Submission {
  submission_id: number;
  user_id: number;
  username: string;
  email: string;
  content: string;
  grade: number | null;
  feedback: string | null;
  submitted_at: string;
  graded_at: string | null;
}

interface Props {
  lesson: Lesson;
  onBack: () => void;
}

export default function AdminAssignmentManage({ lesson, onBack }: Props) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({ title: "", description: "", due_date: "" });
  const [grading, setGrading] = useState<Record<number, { grade: string; feedback: string }>>({});
  const token = localStorage.getItem("token");

  // Load assignments
  const loadAssignments = async () => {
    try {
      const res = await fetch("/api/admin/learning/assignments", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      if (data.success) {
        setAssignments(data.assignments.filter((a: Assignment) => a.course_id === lesson.course_id));
      }
    } catch {
      toast.error("Failed to load assignments");
    }
  };

  // Load submissions
  const loadSubmissions = async (assignmentId: number) => {
    if (!assignmentId) return;
    try {
      const res = await fetch(`/api/admin/learning/assignments/${assignmentId}/submissions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch submissions");
      const data = await res.json();
      setSubmissions(data.success ? data.submissions || [] : []);
    } catch {
      toast.error("Failed to load submissions");
      setSubmissions([]);
    }
  };

  // Save or update assignment
  const handleSaveAssignment = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    setSaving(true);
    try {
      const url = selectedAssignment
        ? `/api/admin/learning/assignments/${selectedAssignment.assignment_id}`
        : "/api/admin/learning/assignments";
      const method = selectedAssignment ? "PATCH" : "POST";
      const body: any = { course_id: lesson.course_id, title: form.title.trim(), description: form.description.trim() || "" };
      if (form.due_date) body.due_date = form.due_date;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(selectedAssignment ? "Assignment updated!" : "Assignment created!");
        setForm({ title: "", description: "", due_date: "" });
        setSelectedAssignment(null);
        setSubmissions([]);
        await loadAssignments();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || "Failed to save assignment");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setSaving(false);
    }
  };

  // Delete assignment
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this assignment and all its submissions?")) return;
    try {
      const res = await fetch(`/api/admin/learning/assignments/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Assignment deleted");
        if (selectedAssignment?.assignment_id === id) {
          setSelectedAssignment(null);
          setSubmissions([]);
        }
        await loadAssignments();
      } else {
        toast.error("Failed to delete");
      }
    } catch {
      toast.error("Network error");
    }
  };

  // Grade submission
  const handleGrade = async (submissionId: number) => {
    const data = grading[submissionId];
    if (!data?.grade.trim()) return toast.error("Please enter a grade");
    const grade = Number(data.grade);
    if (isNaN(grade) || grade < 0 || grade > 100) return toast.error("Grade must be 0–100");

    try {
      const res = await fetch(`/api/admin/learning/assignments/submissions/${submissionId}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ grade, feedback: data.feedback.trim() || null }),
      });
      if (res.ok) {
        toast.success("Grade saved!");
        if (selectedAssignment) await loadSubmissions(selectedAssignment.assignment_id);
        setGrading(prev => ({ ...prev, [submissionId]: { grade: "", feedback: "" } }));
      } else toast.error("Failed to save grade");
    } catch {
      toast.error("Network error");
    }
  };

  useEffect(() => { loadAssignments().then(() => setLoading(false)); }, [lesson.course_id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-gray-400">
        <p className="text-2xl">Loading assignments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] to-[#0B1628] p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-3 text-[#0AEFFF] hover:underline mb-8 text-xl"
        >
          <ArrowLeft className="w-6 h-6" />
          Back to Lesson: {lesson.title}
        </button>

        <h2 className="text-5xl font-bold text-white mb-10">Course Assignments</h2>

        {/* Create/Edit Form */}
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl p-10 border border-[#334155] shadow-2xl mb-12">
          <h3 className="text-3xl font-bold text-[#0AEFFF] mb-8">
            {selectedAssignment ? "Edit Assignment" : "Create New Assignment"}
          </h3>
          <div className="grid gap-6">
            <Input
              placeholder="Assignment Title (required)"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="bg-[#0F172A] border-[#334155] text-white text-lg py-6"
            />
            <Textarea
              placeholder="Description / Instructions"
              rows={6}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="bg-[#0F172A] border-[#334155] text-white text-lg"
            />
            <Input
              type="date"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              className="bg-[#0F172A] border-[#334155] text-white text-lg py-6"
            />
            <div className="flex gap-4">
              <Button
                onClick={handleSaveAssignment}
                disabled={saving}
                className="bg-gradient-to-r from-[#0AEFFF] to-cyan-400 text-black font-bold text-xl py-8"
              >
                {saving ? "Saving..." : selectedAssignment ? "Update" : "Create Assignment"}
              </Button>
              {selectedAssignment && (
                <Button
                  variant="outline"
                  onClick={() => { setSelectedAssignment(null); setForm({ title: "", description: "", due_date: "" }); setSubmissions([]); }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Existing Assignments */}
        <h3 className="text-4xl font-bold text-[#0AEFFF] mb-8">Existing Assignments</h3>
        {assignments.length === 0 ? (
          <p className="text-xl text-gray-500 text-center py-12">No assignments created yet for this course.</p>
        ) : (
          assignments.map((assign) => (
            <div
              key={`${assign.assignment_id}-${assign.created_at}`}
              className="mb-8 last:mb-0 bg-[#1E293B] rounded-2xl p-8 border border-[#334155]"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h4 className="text-2xl font-bold text-white">{assign.title}</h4>
                  {assign.description && <p className="text-gray-300 mt-3 leading-relaxed">{assign.description}</p>}
                  {assign.due_date && (
                    <p className="text-gray-400 mt-2 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Due: {new Date(assign.due_date).toLocaleDateString()}
                    </p>
                  )}
                </div>

                {/* Buttons: Edit / Delete / View Submissions */}
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      setSelectedAssignment(assign);
                      setForm({
                        title: assign.title,
                        description: assign.description || "",
                        due_date: assign.due_date ? assign.due_date.split("T")[0] : "",
                      });
                      loadSubmissions(assign.assignment_id);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Edit2 className="w-4 h-4" /> Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(assign.assignment_id)}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </Button>

                  <Button
                    size="sm"
                    onClick={() => { setSelectedAssignment(assign); loadSubmissions(assign.assignment_id); }}
                  >
                    View Submissions
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}

        {/* Submissions */}
        {submissions.length > 0 && selectedAssignment && (
          <div key={selectedAssignment.assignment_id} className="mt-16">
            <h3 className="text-4xl font-bold text-[#0AEFFF] mb-8">
              Submissions for "{selectedAssignment.title}"
            </h3>

            {submissions.map((sub) => (
              <div
                key={sub.submission_id}
                className="mb-8 last:mb-0 bg-[#1E293B] rounded-2xl p-8 border border-[#334155]"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <User className="w-8 h-8 text-cyan-300" />
                    <div>
                      <p className="text-2xl font-bold text-white">{sub.username || sub.email}</p>
                      <p className="text-gray-400 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Submitted: {new Date(sub.submitted_at).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {sub.grade !== null && (
                    <div className="text-right">
                      <p className="text-3xl font-bold text-green-400">{sub.grade}/100</p>
                      <p className="text-green-300">Graded</p>
                    </div>
                  )}
                </div>

                <div className="bg-[#0F172A]/50 rounded-xl p-6 mb-6">
                  <p className="text-gray-200 whitespace-pre-wrap leading-relaxed">{sub.content}</p>
                </div>

                {sub.grade === null ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      placeholder="Grade (0-100)"
                      value={grading[sub.submission_id]?.grade || ""}
                      onChange={(e) =>
                        setGrading(prev => ({
                          ...prev,
                          [sub.submission_id]: { grade: e.target.value, feedback: prev[sub.submission_id]?.feedback || "" },
                        }))
                      }
                      className="bg-[#0F172A] border-[#334155]"
                    />
                    <Textarea
                      placeholder="Feedback (optional)"
                      rows={3}
                      value={grading[sub.submission_id]?.feedback || ""}
                      onChange={(e) =>
                        setGrading(prev => ({
                          ...prev,
                          [sub.submission_id]: { grade: prev[sub.submission_id]?.grade || "", feedback: e.target.value },
                        }))
                      }
                      className="md:col-span-2 bg-[#0F172A] border-[#334155]"
                    />
                    <Button
                      onClick={() => handleGrade(sub.submission_id)}
                      className="md:col-start-3 bg-green-600 hover:bg-green-500 text-white font-bold"
                    >
                      Submit Grade
                    </Button>
                  </div>
                ) : (
                  <div className="bg-green-900/30 border border-green-600 rounded-xl p-6">
                    <p className="text-green-300 font-bold text-xl mb-2">Grade: {sub.grade}/100</p>
                    {sub.feedback && <p className="text-green-200 italic mt-3">"{sub.feedback}"</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
