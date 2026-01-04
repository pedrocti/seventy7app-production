// LessonsList.tsx
import React, { useState } from "react";
import { Video, FileText, Link2, CheckCircle } from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  content?: string;
  video_url?: string | null;
  pdf_url?: string | null;
  external_link?: string | null;
  completed?: boolean;
}

interface LessonsListProps {
  lessons: Lesson[]; // ← required, you must pass this
  progressPercent?: number;
  onMarkComplete?: (lessonId: number, completed: boolean) => Promise<void>;
  courseId?: number;   // ← added to match Learning.tsx
  onBack?: () => void; // ← added for navigation
}

export default function LessonsList({
  lessons,
  onMarkComplete,
  progressPercent,
  courseId, // now accepted (unused for now, but safe)
  onBack,   // now accepted (unused for now, but safe)
}: LessonsListProps) {
  const [markingInProgress, setMarkingInProgress] = useState<number[]>([]);

  const handleToggleComplete = async (lesson: Lesson) => {
    if (markingInProgress.includes(lesson.id)) return;

    const newCompleted = !lesson.completed;

    if (onMarkComplete) {
      setMarkingInProgress((prev) => [...prev, lesson.id]);
      try {
        await onMarkComplete(lesson.id, newCompleted);
      } catch (err) {
        console.error("Failed to mark lesson complete", err);
        alert("Failed to update completion status. Please try again.");
      } finally {
        setMarkingInProgress((prev) => prev.filter((id) => id !== lesson.id));
      }
    }
  };

  const completedCount = lessons.filter((l) => l.completed).length;
  const displayProgress =
    progressPercent ?? (lessons.length ? Math.round((completedCount / lessons.length) * 100) : 0);

  if (!lessons.length) {
    return (
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-white mb-4">Lessons</h3>
        <div className="p-8 text-center text-gray-400 bg-[#071029] rounded-xl border border-[#0F172A]">
          No lessons available in this course yet.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      {/* Header with progress */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Course Lessons</h3>
        <div className="text-right">
          <p className="text-sm text-gray-400">Your Progress</p>
          <p className="text-3xl font-bold text-[#0AEFFF]">{displayProgress}%</p>
          <div className="w-48 h-3 bg-[#0F172A] rounded-full mt-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0AEFFF] to-cyan-400 transition-all duration-500"
              style={{ width: `${displayProgress}%` }}
            />
          </div>
        </div>
      </div>

      <ul className="space-y-8">
        {lessons.map((lesson) => {
          const isMarking = markingInProgress.includes(lesson.id);
          return (
            <li
              key={lesson.id}
              className="bg-[#071029] rounded-2xl border border-[#0F172A] hover:border-[#0AEFFF]/60 transition-all p-6 shadow-lg"
            >
              <div className="flex flex-col gap-5">
                {/* Lesson Title + Completed Badge */}
                <div className="flex items-center justify-between">
                  <h4 className="text-xl font-bold text-white">{lesson.title}</h4>
                  <button
                    onClick={() => handleToggleComplete(lesson)}
                    disabled={isMarking}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all
                      ${lesson.completed ? "bg-[#0AEFFF] border-[#0AEFFF]" : "border-gray-600 hover:border-[#0AEFFF]"}
                      disabled:opacity-50`}
                  >
                    {lesson.completed && <CheckCircle className="w-5 h-5 text-black" />}
                  </button>
                </div>

                {/* Lesson Content */}
                {lesson.content && (
                  <p className="text-gray-300 leading-relaxed text-justify whitespace-pre-line">
                    {lesson.content}
                  </p>
                )}

                {/* Resources Grid */}
                {(lesson.video_url || lesson.pdf_url || lesson.external_link) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {lesson.video_url && (
                      <a
                        href={lesson.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-[#0F172A]/50 rounded-xl hover:bg-[#0F172A]/80 transition group"
                      >
                        <Video className="w-8 h-8 text-cyan-300 group-hover:text-cyan-200" />
                        <span className="text-cyan-300 group-hover:text-cyan-200 font-medium">
                          Watch Video Lesson
                        </span>
                      </a>
                    )}

                    {lesson.pdf_url && (
                      <a
                        href={lesson.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-[#0F172A]/50 rounded-xl hover:bg-[#0F172A]/80 transition group"
                      >
                        <FileText className="w-8 h-8 text-cyan-300 group-hover:text-cyan-200" />
                        <span className="text-cyan-300 group-hover:text-cyan-200 font-medium">
                          Download PDF Materials
                        </span>
                      </a>
                    )}

                    {lesson.external_link && (
                      <a
                        href={lesson.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-4 bg-[#0F172A]/50 rounded-xl hover:bg-[#0F172A]/80 transition group"
                      >
                        <Link2 className="w-8 h-8 text-cyan-300 group-hover:text-cyan-200" />
                        <span className="text-cyan-300 group-hover:text-cyan-200 font-medium break-words">
                          View External Resource
                        </span>
                      </a>
                    )}
                  </div>
                )}

                {isMarking && (
                  <p className="text-sm text-gray-500 italic">Saving completion status...</p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}