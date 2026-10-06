// client/src/admin/learning/AdminLessonsView.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, ArrowLeft, Video, FileText, Link2, FileCheck } from "lucide-react";

// Course type (for consistency)
interface Course {
  id: number;
  title: string;
  description: string;
}

interface Lesson {
  id: number;
  title: string;
  content: string;
  video_url: string | null;
  pdf_url: string | null;
  external_link: string | null;
  has_assignment: boolean;
  sort_order: number;
}

interface Props {
  selectedCourse: Course;
  lessons: Lesson[];
  lessonForm: {
    title: string;
    content: string;
    video_url: string;
    pdf_url: string;
    external_link: string;
    has_assignment: boolean;
    sort_order: number;
  };
  setLessonForm: React.Dispatch<
    React.SetStateAction<{
      title: string;
      content: string;
      video_url: string;
      pdf_url: string;
      external_link: string;
      has_assignment: boolean;
      sort_order: number;
    }>
  >;
  editingLessonId: number | null;
  setEditingLessonId: React.Dispatch<React.SetStateAction<number | null>>;
  handleCreateLesson: (e: React.FormEvent) => Promise<void>;
  handleDeleteLesson: (id: number) => Promise<void>;
  startLessonEdit: (lesson: Lesson) => void;
  setSelectedCourse: React.Dispatch<React.SetStateAction<Course | null>>;
  loadLessons: (courseId: number) => Promise<void>;
  setSelectedLesson: React.Dispatch<React.SetStateAction<Lesson | null>>;
}

export default function AdminLessonsView({
  selectedCourse,
  lessons,
  lessonForm,
  setLessonForm,
  editingLessonId,
  setEditingLessonId,
  handleCreateLesson,
  handleDeleteLesson,
  startLessonEdit,
  setSelectedCourse,
  loadLessons,
  setSelectedLesson,
}: Props) {
  const cancelLessonEdit = () => {
    setEditingLessonId(null);
    setLessonForm({
      title: "",
      content: "",
      video_url: "",
      pdf_url: "",
      external_link: "",
      has_assignment: false,
      sort_order: 0,
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-[#020617] to-[#0B1628] p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setSelectedCourse(null)}
          className="flex items-center gap-3 text-[#0AEFFF] hover:underline mb-8 text-xl"
        >
          <ArrowLeft className="w-6 h-6" />
          Back to Courses
        </button>

        <h2 className="text-5xl font-bold text-white mb-8">{selectedCourse.title}</h2>

        {/* Add/Edit Lesson Form */}
        <div className="bg-linear-to-br from-[#1E293B] to-[#0F172A] rounded-3xl p-10 border border-[#334155] shadow-2xl mb-12">
          <h3 className="text-3xl font-bold text-[#0AEFFF] mb-8">
            {editingLessonId ? "Edit Lesson" : "Add New Lesson"}
          </h3>
          <form onSubmit={handleCreateLesson} className="grid gap-6">
            <Input
              placeholder="Lesson Title"
              value={lessonForm.title}
              onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
              className="bg-brand-secondary border-[#334155] text-white text-lg py-6 placeholder:text-gray-500 focus:ring-4 focus:ring-[#0AEFFF]/50"
              required
            />

            <textarea
              placeholder="Lesson content/instructions (optional) — use Enter for new paragraphs"
              rows={8}
              value={lessonForm.content}
              onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })}
              className="w-full p-6 bg-brand-secondary border border-[#334155] rounded-2xl text-white text-lg placeholder:text-gray-500 focus:ring-4 focus:ring-[#0AEFFF]/50 resize-y min-h-[200px] leading-relaxed"
            />

            <Input
              placeholder="Video URL (YouTube, Vimeo, etc.)"
              value={lessonForm.video_url}
              onChange={(e) => setLessonForm({ ...lessonForm, video_url: e.target.value })}
              className="bg-brand-secondary border-[#334155] text-white text-lg py-6 placeholder:text-gray-500 focus:ring-4 focus:ring-[#0AEFFF]/50"
            />

            <Input
              placeholder="PDF URL"
              value={lessonForm.pdf_url}
              onChange={(e) => setLessonForm({ ...lessonForm, pdf_url: e.target.value })}
              className="bg-brand-secondary border-[#334155] text-white text-lg py-6 placeholder:text-gray-500 focus:ring-4 focus:ring-[#0AEFFF]/50"
            />

            <Input
              placeholder="External Link (articles, resources, etc.)"
              value={lessonForm.external_link}
              onChange={(e) => setLessonForm({ ...lessonForm, external_link: e.target.value })}
              className="bg-brand-secondary border-[#334155] text-white text-lg py-6 placeholder:text-gray-500 focus:ring-4 focus:ring-[#0AEFFF]/50"
            />

            <div className="flex items-center gap-4">
              <input
                type="checkbox"
                id="has_assignment"
                checked={lessonForm.has_assignment}
                onChange={(e) => setLessonForm({ ...lessonForm, has_assignment: e.target.checked })}
                className="w-6 h-6 text-[#0AEFFF] bg-brand-secondary border-gray-600 rounded focus:ring-[#0AEFFF]"
              />
              <label htmlFor="has_assignment" className="text-white text-lg">
                This lesson has an assignment
              </label>
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                className="flex-1 bg-linear-to-r from-[#0AEFFF] to-cyan-400 text-black font-bold text-xl py-8 hover:from-cyan-400 hover:to-cyan-300 transition-all"
              >
                {editingLessonId ? "Update Lesson" : "Create Lesson"}
              </Button>
              {editingLessonId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={cancelLessonEdit}
                  className="px-8 border-gray-500 text-gray-300 hover:bg-[#334155]"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Lessons List */}
        <h3 className="text-4xl font-bold text-[#0AEFFF] mb-10">Lessons</h3>
        {lessons.length === 0 ? (
          <p className="text-xl text-gray-500 text-center py-12">No lessons yet. Create one above!</p>
        ) : (
          <div className="grid gap-8">
            {lessons.map((lesson) => (
              <div
                key={lesson.id}
                className="bg-[#1E293B] rounded-2xl p-8 border border-[#334155] hover:border-[#0AEFFF] transition cursor-pointer"
                onClick={() => setSelectedLesson(lesson)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-2xl font-bold text-white">{lesson.title}</h4>
                  <div className="flex gap-3">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        startLessonEdit(lesson);
                      }}
                      size="sm"
                      className="bg-[#0AEFFF] text-black hover:bg-cyan-300"
                    >
                      <Edit2 className="w-5 h-5" />
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLesson(lesson.id);
                      }}
                      variant="destructive"
                      size="sm"
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Improved content display with paragraphs and spacing */}
                {lesson.content && (
                  <div className="text-gray-200 mb-6 text-base leading-relaxed whitespace-pre-wrap wrap-break-word">
                    {lesson.content.split('\n\n').map((paragraph, idx) => (
                      <p key={idx} className="mb-4">
                        {paragraph.split('\n').map((line, i) => (
                          <span key={i}>
                            {line}
                            {i < paragraph.split('\n').length - 1 && <br />}
                          </span>
                        ))}
                      </p>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-6 text-base">
                  {lesson.video_url && (
                    <span className="flex items-center gap-3 text-cyan-300">
                      <Video className="w-5 h-5" />
                      <a href={lesson.video_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-200">
                        Video Lesson
                      </a>
                    </span>
                  )}
                  {lesson.pdf_url && (
                    <span className="flex items-center gap-3 text-cyan-300">
                      <FileText className="w-5 h-5" />
                      <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-200">
                        Download PDF
                      </a>
                    </span>
                  )}
                  {lesson.external_link && (
                    <span className="flex items-center gap-3 text-cyan-300">
                      <Link2 className="w-5 h-5" />
                      <a href={lesson.external_link} target="_blank" rel="noopener noreferrer" className="underline hover:text-cyan-200">
                        External Resource
                      </a>
                    </span>
                  )}
                  {lesson.has_assignment && (
                    <span className="flex items-center gap-3 text-yellow-400 font-bold">
                      <FileCheck className="w-5 h-5" />
                      Assignment Required
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}