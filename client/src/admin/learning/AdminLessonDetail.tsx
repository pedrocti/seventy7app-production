import { Button } from "@/components/ui/button";
import { Edit2, Trash2, ArrowLeft, Video, FileText, Link2, FileCheck } from "lucide-react";

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
  selectedLesson: Lesson;
  setSelectedLesson: React.Dispatch<React.SetStateAction<Lesson | null>>;
  startLessonEdit: (lesson: Lesson) => void;
  handleDeleteLesson: (id: number) => Promise<void>;
  // ← This prop comes from AdminLearning.tsx
  openAssignmentManage: (lesson: Lesson) => void;
}

export default function AdminLessonDetail({
  selectedLesson,
  setSelectedLesson,
  startLessonEdit,
  handleDeleteLesson,
  openAssignmentManage,
}: Props) {
  const handleOpenAssignment = () => {
    openAssignmentManage(selectedLesson);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] to-[#0B1628] p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => setSelectedLesson(null)}
          className="flex items-center gap-3 text-[#0AEFFF] hover:underline mb-8 text-xl"
        >
          <ArrowLeft className="w-6 h-6" />
          Back to Lessons
        </button>

        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl p-12 border border-[#334155] shadow-2xl">
          <div className="flex justify-between items-start mb-10">
            <h2 className="text-5xl font-bold text-white">{selectedLesson.title}</h2>
            <div className="flex gap-4">
              <Button onClick={() => startLessonEdit(selectedLesson)} className="bg-[#0AEFFF] text-black font-bold">
                <Edit2 className="mr-2 w-5 h-5" />
                Edit Lesson
              </Button>
              <Button onClick={() => handleDeleteLesson(selectedLesson.id)} variant="destructive">
                <Trash2 className="mr-2 w-5 h-5" />
                Delete
              </Button>
            </div>
          </div>

          {/* Rich content display */}
          {selectedLesson.content && (
            <div className="prose prose-invert prose-lg max-w-none mb-12 text-gray-200 leading-relaxed">
              {selectedLesson.content.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-6 text-lg">
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

          {/* Links section */}
          <div className="grid md:grid-cols-2 gap-8 text-lg">
            {selectedLesson.video_url && (
              <div className="flex items-center gap-4 p-4 bg-[#0F172A]/50 rounded-xl">
                <Video className="w-8 h-8 text-cyan-300" />
                <a
                  href={selectedLesson.video_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 underline hover:text-cyan-200 font-medium"
                >
                  Watch Video Lesson
                </a>
              </div>
            )}
            {selectedLesson.pdf_url && (
              <div className="flex items-center gap-4 p-4 bg-[#0F172A]/50 rounded-xl">
                <FileText className="w-8 h-8 text-cyan-300" />
                <a
                  href={selectedLesson.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 underline hover:text-cyan-200 font-medium"
                >
                  Download PDF Materials
                </a>
              </div>
            )}
            {selectedLesson.external_link && (
              <div className="flex items-center gap-4 p-4 bg-[#0F172A]/50 rounded-xl">
                <Link2 className="w-8 h-8 text-cyan-300" />
                <a
                  href={selectedLesson.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 underline hover:text-cyan-200 font-medium"
                >
                  External Resource / Article
                </a>
              </div>
            )}
            {selectedLesson.has_assignment && (
              <div
                className="flex items-center gap-4 p-6 bg-yellow-900/30 border-2 border-yellow-600 rounded-xl cursor-pointer hover:bg-yellow-900/50 transition-all"
                onClick={handleOpenAssignment}
              >
                <FileCheck className="w-10 h-10 text-yellow-400" />
                <div>
                  <p className="text-yellow-400 font-bold text-2xl">Assignment Required</p>
                  <p className="text-yellow-300 text-sm">Click to manage assignment & view submissions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}