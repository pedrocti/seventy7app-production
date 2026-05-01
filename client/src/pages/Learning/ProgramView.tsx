import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/api/http";
import { useAuth } from "@/auth/AuthContext";
import { toast } from "sonner";

interface Program {
  id: number;
  title: string;
  description: string;
  image_url?: string;
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

export default function ProgramView({
  id,
  onBack,
  onViewCourses,
  onViewCourse,
}: Props) {
  const { token } = useAuth();
  const [program, setProgram] = useState<Program | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    loadProgram();
  }, [id]);

  const loadProgram = async () => {
    try {
      const res = await axios.get(`${API_BASE}/learning/programs/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setProgram(res.data.program || null);
      setCourses(res.data.courses || []);
      setEnrolled(res.data.enrolled || false); // true if user purchased program
    } catch (err) {
      console.error("Failed to fetch program", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      const res = await axios.post(
        `${API_BASE}/learning/programs/${id}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setEnrolled(true);
        toast.success("You have successfully enrolled in the program!");
      }
    } catch (err: any) {
      console.error("Enrollment failed", err);
      toast.error(err?.response?.data?.error || "Enrollment failed");
    }
  };

  /**
   * Only allow course enrollment if user has purchased the program
   */
  const handleCourseEnroll = async (courseId: number) => {
    if (!enrolled) {
      toast.error("You must enroll in the program before accessing its courses.");
      return;
    }

    try {
      const res = await axios.post(
        `${API_BASE}/learning/courses/${courseId}/enroll`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        setCourses((prev) =>
          prev.map((c) =>
            c.id === courseId ? { ...c, enrolled: true } : c
          )
        );
        toast.success("Course enrollment successful!");
      }
    } catch (err: any) {
      console.error("Course enrollment failed", err);
      toast.error(err?.response?.data?.error || "Course enrollment failed");
    }
  };

  const renderFormattedDescription = (text: string) => {
    return text.split("\n").map((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) return null;

      if (trimmed.endsWith(":")) {
        return (
          <h4
            key={index}
            className="mt-8 mb-3 text-xl font-semibold text-cyan-400 border-b border-cyan-400/30 pb-1"
          >
            {trimmed}
          </h4>
        );
      }

      if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
        return (
          <p
            key={index}
            className="text-yellow-400 font-semibold text-lg my-4"
          >
            {trimmed.replace(/\*\*/g, "")}
          </p>
        );
      }

      if (trimmed.startsWith("!!") && trimmed.endsWith("!!")) {
        return (
          <div
            key={index}
            className="bg-cyan-400/10 border border-cyan-400 text-cyan-300 p-4 rounded-lg my-4"
          >
            {trimmed.replace(/!!/g, "")}
          </div>
        );
      }

      if (trimmed.startsWith("-")) {
        return (
          <li
            key={index}
            className="ml-6 list-disc text-gray-300 text-base mb-1"
          >
            {trimmed.replace("-", "").trim()}
          </li>
        );
      }

      return (
        <p key={index} className="text-gray-300 text-base leading-relaxed mb-3">
          {trimmed}
        </p>
      );
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl">
        Loading program...
      </div>
    );
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white text-xl">
        Program not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0B1628] to-[#020617] text-white">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Back Button */}
        <button
          onClick={onBack}
          className="mb-10 text-cyan-400 hover:text-cyan-300 transition"
        >
          ← Back to Programs
        </button>

        {/* Hero Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            {program.title}
          </h1>

          {program.image_url && (
            <img
              src={program.image_url}
              alt={program.title}
              className="w-full h-72 md:h-96 object-cover rounded-2xl shadow-xl mb-8"
            />
          )}
        </div>

        {/* Description + Sticky Enroll */}
        <div className="grid lg:grid-cols-3 gap-12">

          {/* Left Content */}
          <div className="lg:col-span-2">
            <div className="bg-[#0F172A] p-8 rounded-2xl border border-[#1E293B] shadow-lg">
              {renderFormattedDescription(program.description)}
            </div>
          </div>

          {/* Right Sticky Panel */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-24 bg-[#0F172A] p-6 rounded-2xl border border-[#1E293B] shadow-lg">
              {!enrolled ? (
                <button
                  onClick={handleEnroll}
                  className="w-full bg-gradient-to-r from-cyan-400 to-cyan-300 text-black font-semibold py-3 rounded-lg shadow-lg hover:scale-105 transition"
                >
                  Enroll in Program
                </button>
              ) : (
                <div className="w-full text-center py-3 rounded-lg bg-green-600/20 border border-green-500 text-green-400 font-medium">
                  You are enrolled ✔
                </div>
              )}

              <div className="mt-6 text-sm text-gray-400">
                Full access to all included courses and lessons.
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold mb-10">
            Courses Included
          </h2>

          {courses.length === 0 ? (
            <p className="text-gray-400">
              No courses available for this program yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {courses.map((c) => (
                <div
                  key={c.id}
                  className="bg-[#0F172A] p-6 rounded-2xl border border-[#1E293B] shadow-lg hover:shadow-xl transition"
                >
                  <h4 className="text-lg font-semibold mb-3">
                    {c.title}
                  </h4>

                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {c.description}
                  </p>

                  <div className="flex justify-between items-center mb-4">
                    <span className="text-yellow-400 font-semibold">
                      ${c.price}
                    </span>

                    {c.enrolled ? (
                      <span className="text-green-400 text-sm">
                        Enrolled
                      </span>
                    ) : (
                      <button
                        disabled={!enrolled}
                        onClick={() => handleCourseEnroll(c.id)}
                        className={`px-4 py-1.5 rounded text-sm transition ${
                          enrolled
                            ? "bg-blue-600 hover:bg-blue-500 text-white"
                            : "bg-gray-600 cursor-not-allowed text-gray-300"
                        }`}
                      >
                        Enroll
                      </button>
                    )}
                  </div>

                  {c.enrolled && (
                    <button
                      onClick={() => onViewCourse?.(c.id)}
                      className="w-full bg-cyan-400 hover:bg-cyan-300 text-black px-4 py-2 rounded-lg font-medium transition"
                    >
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