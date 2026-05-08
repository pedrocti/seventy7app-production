// client/src/admin/learning/AdminCoursesView.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Plus, Users, CheckCircle2, XCircle, UserPlus } from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
}

interface Program {
  id: number;
  title: string;
  description: string | null;
  price: string;
  duration_days: number;
  thumbnail_url?: string | null;
}

interface EnrolledUser {
  enrollment_id: number;
  user_id: number | null;
  username: string | null;
  email: string | null;
  status: string;
  progress_percent: string;
  amount_paid: string;
  enrolled_at: string | null;
}

interface Props {
  selectedProgram: Program;
  courses: Course[];
  loadingCourses: boolean;
  courseForm: { title: string; description: string };
  setCourseForm: React.Dispatch<React.SetStateAction<{ title: string; description: string }>>;
  handleCreateCourse: (e: React.FormEvent) => Promise<void>;
  handleDeleteCourse: (id: number) => Promise<void>;
  setSelectedProgram: React.Dispatch<React.SetStateAction<Program | null>>;
  setSelectedCourse: React.Dispatch<React.SetStateAction<Course | null>>;
  loadLessons: (courseId: number) => Promise<void>;
}

export default function AdminCoursesView({
  selectedProgram,
  courses,
  loadingCourses,
  courseForm,
  setCourseForm,
  handleCreateCourse,
  handleDeleteCourse,
  setSelectedProgram,
  setSelectedCourse,
  loadLessons,
}: Props) {
  const token = localStorage.getItem("token");

  // Enrolled users state
  const [enrolledUsers, setEnrolledUsers] = useState<EnrolledUser[]>([]);
  const [loadingEnrolled, setLoadingEnrolled] = useState(false);
  const [showEnrolled, setShowEnrolled] = useState(false);

  // Grant access state
  const [grantEmail, setGrantEmail] = useState("");
  const [grantingAccess, setGrantingAccess] = useState(false);

  const loadEnrolledUsers = async () => {
    setLoadingEnrolled(true);
    try {
      const res = await fetch(`/api/admin/learning/enrollments/program/${selectedProgram.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setEnrolledUsers(data.enrollments || []);
      } else {
        toast.error(data.error || "Failed to load enrolled users");
      }
    } catch {
      toast.error("Failed to load enrolled users");
    } finally {
      setLoadingEnrolled(false);
    }
  };

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantEmail.trim()) return;

    setGrantingAccess(true);
    try {
      // Fetch all users and find by email or username (admin endpoint has no search param)
      const userRes = await fetch(`/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = await userRes.json();
      const allUsers: any[] = userData.users || [];
      const query = grantEmail.trim().toLowerCase();
      const match = allUsers.find(
        (u: any) =>
          u.email?.toLowerCase() === query ||
          u.username?.toLowerCase() === query
      );

      if (!match) {
        toast.error("No user found with that email or username");
        setGrantingAccess(false);
        return;
      }

      // Grant access
      const grantRes = await fetch("/api/admin/learning/enrollments/grant-program", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: match.id, program_id: selectedProgram.id }),
      });
      const grantData = await grantRes.json();

      if (grantData.success) {
        if (grantData.alreadyEnrolled) {
          toast.info(`${match.username} already has access to this program.`);
        } else {
          toast.success(grantData.message || "Access granted successfully!");
        }
        setGrantEmail("");
        if (showEnrolled) loadEnrolledUsers();
      } else {
        toast.error(grantData.error || "Failed to grant access");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setGrantingAccess(false);
    }
  };

  const revokeAccess = async (userId: number | null, username: string | null) => {
    if (!userId) return;
    if (!confirm(`Revoke ${username ?? "user"}'s access to this program?`)) return;
    try {
      const res = await fetch("/api/admin/learning/enrollments/revoke-program", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: userId, program_id: selectedProgram.id }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Access revoked");
        setEnrolledUsers((prev) => prev.filter((u) => u.user_id !== userId));
      } else {
        toast.error(data.error || "Failed to revoke access");
      }
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <div className="min-h-screen p-8" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <button
          onClick={() => setSelectedProgram(null)}
          className="flex items-center gap-3 text-xl transition hover:opacity-70"
          style={{ color: "var(--cyan)" }}
        >
          <ArrowLeft className="w-6 h-6" />
          Back to Programs
        </button>

        <div>
          <h2 className="text-4xl font-bold" style={{ color: "var(--text)" }}>{selectedProgram.title}</h2>
          <p className="mt-2" style={{ color: "var(--muted)" }}>
            ${selectedProgram.price} · {selectedProgram.duration_days} days access
          </p>
        </div>

        {/* ── Grant Access Panel ── */}
        <div
          className="rounded-3xl p-8 border"
          style={{ background: "var(--surface)", borderColor: "var(--cyan-line)" }}
        >
          <div className="flex items-center gap-3 mb-6">
            <UserPlus className="w-6 h-6" style={{ color: "var(--cyan)" }} />
            <h3 className="text-2xl font-bold" style={{ color: "var(--cyan)" }}>Grant Program Access</h3>
          </div>
          <p className="mb-6 text-sm" style={{ color: "var(--muted)" }}>
            Grant a user free access to this program regardless of price. Enter their email or username.
          </p>
          <form onSubmit={handleGrantAccess} className="flex gap-4">
            <Input
              placeholder="User email or username"
              value={grantEmail}
              onChange={(e) => setGrantEmail(e.target.value)}
              className="flex-1 text-lg py-5"
              style={{ background: "var(--surface-2)", borderColor: "var(--surface-3)", color: "var(--text)" }}
              required
            />
            <Button
              type="submit"
              disabled={grantingAccess}
              className="font-bold px-8 border-0"
              style={{ background: "linear-gradient(to right, var(--cyan), #67e8f9)", color: "#000" }}
            >
              {grantingAccess ? "Granting..." : "Grant Access"}
            </Button>
          </form>
        </div>

        {/* ── Enrolled Users Panel ── */}
        <div
          className="rounded-3xl border overflow-hidden"
          style={{ background: "var(--surface)", borderColor: "var(--surface-3)" }}
        >
          <button
            className="w-full flex items-center justify-between p-8 text-left"
            onClick={() => {
              const next = !showEnrolled;
              setShowEnrolled(next);
              if (next && enrolledUsers.length === 0) loadEnrolledUsers();
            }}
          >
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6" style={{ color: "var(--cyan)" }} />
              <span className="text-2xl font-bold" style={{ color: "var(--cyan)" }}>
                Enrolled Users
              </span>
            </div>
            <span style={{ color: "var(--muted)" }}>{showEnrolled ? "▲ Hide" : "▼ Show"}</span>
          </button>

          {showEnrolled && (
            <div className="px-8 pb-8">
              {loadingEnrolled ? (
                <p className="text-center py-8" style={{ color: "var(--muted)" }}>Loading...</p>
              ) : enrolledUsers.length === 0 ? (
                <p className="text-center py-8" style={{ color: "var(--muted)" }}>No users enrolled yet.</p>
              ) : (
                <div className="space-y-3">
                  {enrolledUsers.map((u) => (
                    <div
                      key={u.enrollment_id}
                      className="flex items-center justify-between p-4 rounded-xl border"
                      style={{ background: "var(--surface-2)", borderColor: "var(--surface-3)" }}
                    >
                      <div>
                        <p className="font-semibold" style={{ color: "var(--text)" }}>{u.username ?? "Unknown"}</p>
                        <p className="text-sm" style={{ color: "var(--muted)" }}>{u.email}</p>
                        <p className="text-xs mt-1" style={{ color: "var(--muted-2)" }}>
                          Progress: {u.progress_percent}% · Paid: ${u.amount_paid}
                        </p>
                      </div>
                      <button
                        onClick={() => revokeAccess(u.user_id, u.username)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition hover:opacity-80 border-0"
                        style={{ background: "var(--red-dim)", color: "var(--red)" }}
                      >
                        <XCircle className="w-4 h-4" />
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Add Course Form ── */}
        <div
          className="rounded-3xl p-10 border"
          style={{ background: "linear-gradient(135deg, var(--surface-4), var(--surface))", borderColor: "var(--surface-3)" }}
        >
          <h3 className="text-3xl font-bold mb-8" style={{ color: "var(--cyan)" }}>Add New Course</h3>
          <form onSubmit={handleCreateCourse} className="grid gap-6">
            <Input
              placeholder="Course Title"
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              className="text-lg py-6"
              style={{ background: "var(--surface)", borderColor: "var(--surface-3)", color: "var(--text)" }}
              required
            />
            <textarea
              placeholder="Course description (optional)"
              rows={4}
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              className="p-6 rounded-2xl text-lg resize-none border"
              style={{ background: "var(--surface)", borderColor: "var(--surface-3)", color: "var(--text)" }}
            />
            <Button
              type="submit"
              className="font-bold text-xl py-8 border-0"
              style={{ background: "linear-gradient(to right, var(--cyan), #67e8f9)", color: "#000" }}
            >
              <Plus className="mr-3 w-6 h-6" />
              Create Course
            </Button>
          </form>
        </div>

        {/* ── Courses List ── */}
        <div>
          <h3 className="text-3xl font-bold mb-8" style={{ color: "var(--cyan)" }}>Courses</h3>
          {loadingCourses ? (
            <p className="text-xl text-center py-12" style={{ color: "var(--muted)" }}>Loading courses...</p>
          ) : courses.length === 0 ? (
            <p className="text-xl text-center py-12" style={{ color: "var(--muted)" }}>
              No courses yet. Create one above!
            </p>
          ) : (
            <div className="grid gap-6">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="rounded-2xl p-8 border flex justify-between items-center hover:scale-[1.01] transition cursor-pointer"
                  style={{ background: "var(--surface)", borderColor: "var(--surface-3)" }}
                >
                  <div>
                    <h4 className="text-2xl font-bold" style={{ color: "var(--text)" }}>{c.title}</h4>
                    {c.description && (
                      <p className="mt-2" style={{ color: "var(--text-2)" }}>{c.description}</p>
                    )}
                  </div>
                  <div className="flex gap-4 flex-shrink-0 ml-6">
                    <Button
                      onClick={(e) => { e.stopPropagation(); handleDeleteCourse(c.id); }}
                      variant="destructive"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedCourse(c);
                        loadLessons(c.id);
                      }}
                      className="font-bold border-0"
                      style={{ background: "linear-gradient(to right, var(--cyan), #67e8f9)", color: "#000" }}
                    >
                      Manage Lessons
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
