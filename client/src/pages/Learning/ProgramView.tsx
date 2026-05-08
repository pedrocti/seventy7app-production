import { useEffect, useState } from "react";
import { apiRequest } from "@/api/http";
import { toast } from "sonner";
import { ArrowLeft, CheckCircle2, Lock, BookOpen, PlayCircle } from "lucide-react";

interface Program {
  id: number;
  title: string;
  description: string;
  image_url?: string;
  thumbnail_url?: string;
  price: string;
}

interface Course {
  id: number;
  title: string;
  description: string;
  is_active: boolean;
  price: string;
  enrolled?: boolean;
}

interface Props {
  id: number;
  onBack: () => void;
  onViewCourses: () => void;
  onViewCourse?: (courseId: number) => void;
}

export default function ProgramView({ id, onBack, onViewCourse }: Props) {
  const [program, setProgram] = useState<Program | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [enrollingCourseId, setEnrollingCourseId] = useState<number | null>(null);

  useEffect(() => {
    loadProgram();
  }, [id]);

  const loadProgram = async () => {
    setLoading(true);
    const res = await apiRequest(`/learning/programs/${id}`);
    if (res.success) {
      setProgram((res as any).program || null);
      setCourses((res as any).courses || []);
      setEnrolled(!!(res as any).enrolled);
    } else {
      toast.error(res.error || "Failed to load program");
    }
    setLoading(false);
  };

  const handleEnroll = async () => {
    const price = Number(program?.price ?? 0);

    // Paid programs must go through the buy flow (ProgramsList page)
    if (price > 0) {
      toast.error("This is a paid program. Please purchase it from the programs list.");
      return;
    }

    setEnrolling(true);
    const res = await apiRequest(`/learning/programs/${id}/enroll`, { method: "POST" });
    if (res.success) {
      setEnrolled(true);
      // Refresh to get updated course enrollment status
      await loadProgram();
      toast.success("You are now enrolled in this program!");
    } else {
      toast.error(res.error || "Enrollment failed");
    }
    setEnrolling(false);
  };

  const handleCourseEnroll = async (courseId: number) => {
    if (!enrolled) {
      toast.error("Enroll in the program first to access its courses.");
      return;
    }
    setEnrollingCourseId(courseId);
    const res = await apiRequest(`/learning/courses/${courseId}/enroll`, { method: "POST" });
    if (res.success) {
      setCourses((prev) =>
        prev.map((c) => (c.id === courseId ? { ...c, enrolled: true } : c))
      );
      toast.success("Course enrollment successful!");
    } else {
      toast.error(res.error || "Course enrollment failed");
    }
    setEnrollingCourseId(null);
  };

  const renderDescription = (text: string) => {
    return text.split("\n").map((line, i) => {
      const t = line.trim();
      if (!t) return null;

      if (t.endsWith(":")) {
        return (
          <h4 key={i} className="mt-8 mb-3 text-xl font-semibold border-b pb-1" style={{ color: "var(--cyan)", borderColor: "var(--cyan-line)" }}>
            {t}
          </h4>
        );
      }
      if (t.startsWith("**") && t.endsWith("**")) {
        return (
          <p key={i} className="font-semibold text-lg my-4" style={{ color: "var(--gold)" }}>
            {t.replace(/\*\*/g, "")}
          </p>
        );
      }
      if (t.startsWith("!!") && t.endsWith("!!")) {
        return (
          <div key={i} className="p-4 rounded-lg my-4 border" style={{ background: "var(--cyan-dim)", borderColor: "var(--cyan)", color: "var(--cyan)" }}>
            {t.replace(/!!/g, "")}
          </div>
        );
      }
      if (t.startsWith("-")) {
        return (
          <li key={i} className="ml-6 list-disc mb-1" style={{ color: "var(--text-2)" }}>
            {t.replace("-", "").trim()}
          </li>
        );
      }
      return (
        <p key={i} className="text-base leading-relaxed mb-3" style={{ color: "var(--text-2)" }}>
          {t}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <div className="text-center animate-pulse">
          <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--cyan)" }} />
          <p className="text-xl" style={{ color: "var(--text-2)" }}>Loading program...</p>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)", color: "var(--text)" }}>
        <p className="text-xl" style={{ color: "var(--muted)" }}>Program not found.</p>
      </div>
    );
  }

  const coverImage = program.image_url || program.thumbnail_url;
  const isFree = Number(program.price) === 0;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 mb-10 transition-opacity hover:opacity-70"
          style={{ color: "var(--cyan)" }}
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Programs
        </button>

        {/* Hero Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "var(--text)" }}>
            {program.title}
          </h1>
          {coverImage && (
            <img
              src={coverImage}
              alt={program.title}
              className="w-full h-72 md:h-96 object-cover rounded-2xl shadow-xl mb-8"
            />
          )}
        </div>

        {/* Content + Sidebar */}
        <div className="grid lg:grid-cols-3 gap-12">

          {/* Description */}
          <div className="lg:col-span-2">
            <div className="p-8 rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--surface-3)" }}>
              {renderDescription(program.description || "")}
            </div>
          </div>

          {/* Sticky Enroll Panel */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 p-6 rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--surface-3)" }}>
              {/* Price */}
              <p className="text-3xl font-bold mb-4" style={{ color: "var(--cyan)" }}>
                {isFree ? "FREE" : `$${program.price}`}
              </p>

              {enrolled ? (
                <div className="w-full text-center py-3 rounded-lg border flex items-center justify-center gap-2 font-medium"
                  style={{ background: "var(--green-dim)", borderColor: "var(--green)", color: "var(--green)" }}>
                  <CheckCircle2 className="w-5 h-5" />
                  You are enrolled
                </div>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling || !isFree}
                  className="w-full font-semibold py-3 rounded-lg shadow-lg transition hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed border-0"
                  style={{
                    background: isFree
                      ? "linear-gradient(to right, var(--cyan), #67e8f9)"
                      : "var(--surface-3)",
                    color: isFree ? "#000" : "var(--muted)",
                  }}
                >
                  {enrolling
                    ? "Enrolling..."
                    : isFree
                    ? "Enroll in Program"
                    : "Purchase Required"}
                </button>
              )}

              {!isFree && !enrolled && (
                <p className="mt-3 text-xs text-center" style={{ color: "var(--muted)" }}>
                  Go back to programs and click "Buy & Access" to purchase.
                </p>
              )}

              <p className="mt-6 text-sm" style={{ color: "var(--muted)" }}>
                Full access to all included courses and lessons.
              </p>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-10" style={{ color: "var(--text)" }}>
            Courses Included
          </h2>

          {courses.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No courses available for this program yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="p-6 rounded-2xl border transition hover:shadow-xl"
                  style={{
                    background: "var(--surface)",
                    borderColor: c.enrolled ? "var(--green)" : "var(--surface-3)",
                  }}
                >
                  <h4 className="text-lg font-semibold mb-3" style={{ color: "var(--text)" }}>
                    {c.title}
                  </h4>

                  <p className="text-sm mb-4 line-clamp-3" style={{ color: "var(--muted)" }}>
                    {c.description}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <span className="font-semibold" style={{ color: "var(--gold)" }}>
                      {Number(c.price) === 0 ? "Included" : `$${c.price}`}
                    </span>

                    {c.enrolled ? (
                      <span className="flex items-center gap-1 text-sm" style={{ color: "var(--green)" }}>
                        <CheckCircle2 className="w-4 h-4" />
                        Enrolled
                      </span>
                    ) : (
                      <button
                        disabled={!enrolled || enrollingCourseId === c.id}
                        onClick={() => handleCourseEnroll(c.id)}
                        className="px-4 py-1.5 rounded text-sm font-medium transition border-0"
                        style={{
                          background: enrolled ? "var(--cyan)" : "var(--surface-3)",
                          color: enrolled ? "#000" : "var(--muted)",
                          cursor: enrolled ? "pointer" : "not-allowed",
                          opacity: enrolled ? 1 : 0.6,
                        }}
                      >
                        {enrollingCourseId === c.id ? "Enrolling..." : enrolled ? "Enroll" : <><Lock className="w-3 h-3 inline mr-1" />Locked</>}
                      </button>
                    )}
                  </div>

                  {c.enrolled && (
                    <button
                      onClick={() => onViewCourse?.(c.id)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition hover:opacity-80 border-0"
                      style={{
                        background: "linear-gradient(to right, var(--cyan), #67e8f9)",
                        color: "#000",
                      }}
                    >
                      <PlayCircle className="w-4 h-4" />
                      Enter Course
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
