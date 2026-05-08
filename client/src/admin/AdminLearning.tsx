import { useEffect, useState } from "react";
import { toast } from "sonner";
import AdminProgramsList from "./learning/AdminProgramsList";
import AdminCoursesView from "./learning/AdminCoursesView";
import AdminLessonsView from "./learning/AdminLessonsView";
import AdminLessonDetail from "./learning/AdminLessonDetail";
import AdminAssignmentManage from "./learning/AdminAssignmentManage";

interface Program {
  id: number;
  title: string;
  description: string | null;
  price: string;
  duration_days: number;
  thumbnail_url?: string | null; 
}

interface Course {
  id: number;
  title: string;
  description: string;
}

// Updated Lesson interface — course_id is now included for assignment management
interface Lesson {
  id: number;
  title: string;
  content: string;
  video_url: string | null;
  pdf_url: string | null;
  external_link: string | null;
  has_assignment: boolean;
  sort_order: number;
  course_id: number; 
}

export default function AdminLearning() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [selectedLessonForAssignment, setSelectedLessonForAssignment] = useState<Lesson | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);

  // Forms
  const [programForm, setProgramForm] = useState({
    title: "",
    description: "",
    price: "0",
    duration_days: "30",
    thumbnail_url: "",
  });
  const [editingProgramId, setEditingProgramId] = useState<number | null>(null);
  const [courseForm, setCourseForm] = useState({ title: "", description: "" });
  const [lessonForm, setLessonForm] = useState({
    title: "",
    content: "",
    video_url: "",
    pdf_url: "",
    external_link: "",
    has_assignment: false,
    sort_order: 0,
  });
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);

  const token = localStorage.getItem("token");

  // Data loading functions
  const loadPrograms = async () => {
    try {
      const res = await fetch("/api/admin/learning/programs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setPrograms(data.programs || []);
    } catch (err) {
      toast.error("Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  const loadCourses = async (programId: number) => {
    setLoadingCourses(true);
    try {
      const res = await fetch(`/api/admin/learning/courses/program/${programId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setCourses(data.data || []);
    } catch (err) {
      toast.error("Failed to load courses");
    } finally {
      setLoadingCourses(false);
    }
  };

  const loadLessons = async (courseId: number) => {
    setLoadingLessons(true);
    try {
      const res = await fetch(`/api/admin/learning/lessons/course/${courseId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        // Ensure each lesson has course_id
        const lessonsWithCourseId = (data.lessons || []).map((lesson: any) => ({
          ...lesson,
          course_id: courseId,
        }));
        setLessons(lessonsWithCourseId);
      }
    } catch (err) {
      toast.error("Failed to load lessons");
    } finally {
      setLoadingLessons(false);
    }
  };

  useEffect(() => {
    loadPrograms();
  }, []);

  const handleProgramSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!programForm.title.trim()) {
      toast.error("Title is required");
      return;
    }

    try {
      const url = editingProgramId
        ? `/api/admin/learning/programs/${editingProgramId}`
        : "/api/admin/learning/programs";

      const method = editingProgramId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: programForm.title.trim(),
          description: programForm.description.trim() || null,
          price: programForm.price,
          duration_days: Number(programForm.duration_days),
          thumbnail_url: programForm.thumbnail_url?.trim() || null,
        }),
      });

      if (res.ok) {
        toast.success(editingProgramId ? "Program updated!" : "Program created!");
        setProgramForm({ title: "", description: "", price: "0", duration_days: "30", thumbnail_url: "" });
        setEditingProgramId(null);
        loadPrograms();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to save program");
      }
    } catch (err) {
      console.error("Program submit error:", err);
      toast.error("Network error - please try again");
    }
  };

  const handleDeleteProgram = async (id: number) => {
    if (!confirm("Delete program? All courses and lessons will be deleted.")) return;
    try {
      const res = await fetch(`/api/admin/learning/programs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Program deleted");
        loadPrograms();
        setSelectedProgram(null);
      } else {
        toast.error("Failed to delete");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const startProgramEdit = (p: Program) => {
    setProgramForm({
      title: p.title,
      description: p.description || "",
      price: p.price,
      duration_days: p.duration_days.toString(),
      thumbnail_url: p.thumbnail_url || "",
    });
    setEditingProgramId(p.id);
  };

  // Course handlers
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseForm.title.trim() || !selectedProgram) return;

    try {
      const res = await fetch("/api/admin/learning/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: courseForm.title.trim(),
          description: courseForm.description.trim() || "",
          program_id: selectedProgram.id,
        }),
      });

      if (res.ok) {
        toast.success("Course created!");
        setCourseForm({ title: "", description: "" });
        loadCourses(selectedProgram.id);
      } else {
        toast.error("Failed to create course");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleDeleteCourse = async (id: number) => {
    if (!confirm("Delete course and all lessons?")) return;
    try {
      const res = await fetch(`/api/admin/learning/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Course deleted");
        loadCourses(selectedProgram!.id);
        setSelectedCourse(null);
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  // Lesson handlers
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title.trim() || !selectedCourse) return;

    try {
      const url = editingLessonId
        ? `/api/admin/learning/lessons/${editingLessonId}`
        : "/api/admin/learning/lessons";
      const method = editingLessonId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: lessonForm.title.trim(),
          content: lessonForm.content.trim(),
          video_url: lessonForm.video_url.trim() || null,
          pdf_url: lessonForm.pdf_url.trim() || null,
          external_link: lessonForm.external_link.trim() || null,
          has_assignment: lessonForm.has_assignment,
          course_id: selectedCourse.id,
          sort_order: lessonForm.sort_order,
        }),
      });

      if (res.ok) {
        toast.success(editingLessonId ? "Lesson updated!" : "Lesson created!");
        setLessonForm({
          title: "",
          content: "",
          video_url: "",
          pdf_url: "",
          external_link: "",
          has_assignment: false,
          sort_order: 0,
        });
        setEditingLessonId(null);
        loadLessons(selectedCourse.id);
      } else {
        toast.error("Failed to save lesson");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const handleDeleteLesson = async (id: number) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      const res = await fetch(`/api/admin/learning/lessons/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success("Lesson deleted");
        loadLessons(selectedCourse!.id);
      }
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  const startLessonEdit = (lesson: Lesson) => {
    setLessonForm({
      title: lesson.title,
      content: lesson.content || "",
      video_url: lesson.video_url || "",
      pdf_url: lesson.pdf_url || "",
      external_link: lesson.external_link || "",
      has_assignment: lesson.has_assignment,
      sort_order: lesson.sort_order,
    });
    setEditingLessonId(lesson.id);
  };

  // Assignment management handlers
  const openAssignmentManage = (lesson: Lesson) => {
    setSelectedLessonForAssignment(lesson);
  };

  const closeAssignmentManage = () => {
    setSelectedLessonForAssignment(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <p className="text-2xl text-gray-400">Loading...</p>
      </div>
    );
  }

  // Assignment Management View (highest priority)
  if (selectedLessonForAssignment) {
    return (
      <AdminAssignmentManage
        lesson={selectedLessonForAssignment}
        onBack={closeAssignmentManage}
      />
    );
  }

  // Lesson Detail View
  if (selectedLesson) {
    return (
      <AdminLessonDetail
        selectedLesson={selectedLesson}
        setSelectedLesson={setSelectedLesson}
        startLessonEdit={startLessonEdit}
        handleDeleteLesson={handleDeleteLesson}
        openAssignmentManage={openAssignmentManage}
      />
    );
  }

  // Lessons View
  if (selectedCourse) {
    return (
      <AdminLessonsView
        selectedCourse={selectedCourse}
        lessons={lessons}
        lessonForm={lessonForm}
        setLessonForm={setLessonForm}
        editingLessonId={editingLessonId}
        setEditingLessonId={setEditingLessonId}
        handleCreateLesson={handleCreateLesson}
        handleDeleteLesson={handleDeleteLesson}
        startLessonEdit={startLessonEdit}
        setSelectedCourse={setSelectedCourse}
        loadLessons={loadLessons}
        setSelectedLesson={setSelectedLesson}
      />
    );
  }

  // Courses View
  if (selectedProgram) {
    return (
      <AdminCoursesView
        selectedProgram={selectedProgram}
        courses={courses}
        loadingCourses={loadingCourses}
        courseForm={courseForm}
        setCourseForm={setCourseForm}
        handleCreateCourse={handleCreateCourse}
        handleDeleteCourse={handleDeleteCourse}
        setSelectedProgram={setSelectedProgram}
        setSelectedCourse={setSelectedCourse}
        loadLessons={loadLessons}
      />
    );
  }

  // Default: Programs List
  return (
    <AdminProgramsList
      programs={programs}
      selectedProgram={selectedProgram}
      programForm={programForm}
      editingProgramId={editingProgramId}
      setProgramForm={setProgramForm}
      setEditingProgramId={setEditingProgramId}
      handleProgramSubmit={handleProgramSubmit}
      startProgramEdit={startProgramEdit}
      handleDeleteProgram={handleDeleteProgram}
      viewProgram={(p) => {
        setSelectedProgram(p);
        loadCourses(p.id);
      }}
      
    />
  );
  
}