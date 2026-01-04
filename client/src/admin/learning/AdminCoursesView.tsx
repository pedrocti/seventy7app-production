// client/src/admin/learning/AdminCoursesView.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ArrowLeft, Trash2, Plus } from "lucide-react";

interface Course {
  id: number;
  title: string;
  description: string;
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
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] to-[#0B1628] p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setSelectedProgram(null)}
          className="flex items-center gap-3 text-[#0AEFFF] hover:underline mb-8 text-xl"
        >
          <ArrowLeft className="w-6 h-6" />
          Back to Programs
        </button>

        <h2 className="text-5xl font-bold text-white mb-8">{selectedProgram.title}</h2>

        {/* Add Course Form */}
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl p-10 border border-[#334155] shadow-2xl mb-12">
          <h3 className="text-3xl font-bold text-[#0AEFFF] mb-8">Add New Course</h3>
          <form onSubmit={handleCreateCourse} className="grid gap-6">
            <Input
              placeholder="Course Title"
              value={courseForm.title}
              onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
              className="bg-[#0F172A] border-[#334155] text-white text-lg py-6"
              required
            />
            <textarea
              placeholder="Course description (optional)"
              rows={4}
              value={courseForm.description}
              onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
              className="p-6 bg-[#0F172A] border border-[#334155] rounded-2xl text-white text-lg resize-none"
            />
            <Button type="submit" className="bg-[#0AEFFF] text-black font-bold text-xl py-8">
              <Plus className="mr-3 w-6 h-6" />
              Create Course
            </Button>
          </form>
        </div>

        {/* Courses List */}
        <h3 className="text-4xl font-bold text-[#0AEFFF] mb-10">Courses</h3>
        {loadingCourses ? (
          <p className="text-xl text-gray-400 text-center py-12">Loading courses...</p>
        ) : courses.length === 0 ? (
          <p className="text-xl text-gray-500 text-center py-12">No courses yet. Create one above!</p>
        ) : (
          <div className="grid gap-8">
            {courses.map((c) => (
              <div
                key={c.id}
                className="bg-[#1E293B] rounded-2xl p-8 border border-[#334155] flex justify-between items-center hover:border-[#0AEFFF] transition cursor-pointer"
              >
                <div>
                  <h4 className="text-2xl font-bold text-white">{c.title}</h4>
                  {c.description && <p className="text-gray-300 mt-3">{c.description}</p>}
                </div>
                <div className="flex gap-4">
                  <Button onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCourse(c.id);
                  }} variant="destructive">
                    <Trash2 className="w-5 h-5" />
                  </Button>
                  <Button onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCourse(c);
                    loadLessons(c.id);
                  }} className="bg-[#0AEFFF] text-black font-bold">
                    Manage Lessons
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}