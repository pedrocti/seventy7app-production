import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "@/api/http";
import { useAuth } from "@/auth/AuthContext";

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

// Updated Props with the new onViewCourse
interface Props {
  id: number;
  onBack: () => void;
  onViewCourses: () => void;
  onViewCourse?: (courseId: number) => void; // ← This enables state-based navigation
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
      setEnrolled(res.data.enrolled || false);
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
      }
    } catch (err) {
      console.error("Enrollment failed", err);
    }
  };

  const handleCourseEnroll = async (courseId: number) => {
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
      }
    } catch (err) {
      console.error("Course enrollment failed", err);
    }
  };

  if (loading) return <p className="text-white">Loading...</p>;
  if (!program) return <p className="text-white">Program not found</p>;

  return (
    <div className="p-4">
      <button onClick={onBack} className="mb-4 text-blue-400 hover:text-blue-300">
        ← Back
      </button>

      <h2 className="text-2xl font-bold mb-2 text-white">{program.title}</h2>

      {program.image_url && (
        <img
          src={program.image_url}
          alt={program.title}
          className="w-full h-56 object-cover rounded mb-4"
        />
      )}

      <p className="text-gray-300 mb-6">{program.description}</p>

      {!enrolled ? (
        <button
          onClick={handleEnroll}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
        >
          Enroll in Program
        </button>
      ) : (
        <div className="p-2 bg-green-100 text-green-700 rounded inline-block mb-4">
          You are enrolled ✔
        </div>
      )}

      <h3 className="text-xl font-bold mt-6 mb-2 text-white">Courses in this Program</h3>

      {courses.length === 0 ? (
        <p className="text-gray-400">
          No courses available for this program yet. Stay tuned!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {courses.map((c) => (
            <div
              key={c.id}
              className="border-2 border-yellow-500 rounded p-3 bg-black shadow text-white"
            >
              <h4 className="font-semibold">{c.title}</h4>
              <p className="text-gray-300 text-sm mt-1 line-clamp-3">
                {c.description}
              </p>

              <div className="mt-3 flex justify-between items-center">
                <span className="text-yellow-400 font-semibold">${c.price}</span>

                {c.enrolled ? (
                  <span className="text-green-400 text-sm">Enrolled</span>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCourseEnroll(c.id);
                    }}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                  >
                    Enroll
                  </button>
                )}
              </div>

              {c.enrolled && (
                <button
                  onClick={() => onViewCourse?.(c.id)}  // ← FIXED: uses state navigation
                  className="mt-2 w-full bg-[#0AEFFF] text-black px-3 py-2 rounded text-sm hover:bg-cyan-300 font-medium shadow-md transition"
                >
                  Enter Course → Lessons & Assignments
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}