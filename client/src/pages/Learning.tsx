// client/src/pages/Learning.tsx
import { useState } from "react";
import ProgramsList from "./Learning/ProgramsList";
import ProgramView from "./Learning/ProgramView";
import Courses from "./Learning/Courses";
import CourseView from "./Learning/CourseView";
import LessonsList from "./Learning/LessonsList";
import AssignmentsList from "./Learning/AssignmentsList";
import SubmitModal from "./Learning/SubmitModal";
import Progress from "./Learning/Progress";

// Define navigation screen types
type Page =
  | "programs"
  | "program"
  | "courses"
  | "course"
  | "lessons"
  | "assignments"
  | "progress"
  | "submit";

interface Screen {
  page: Page;
  id?: number;
}

export default function LearningPage() {
  const [screen, setScreen] = useState<Screen>({
    page: "programs",
    id: undefined,
  });

  const go = (page: Page, id?: number) => setScreen({ page, id });

  return (
    <div className="space-y-6 p-4">
      {screen.page === "programs" && (
        <ProgramsList onSelect={(id) => go("program", id)} />
      )}

      {screen.page === "program" && screen.id !== undefined && (
        <ProgramView
          id={screen.id}
          onBack={() => go("programs")}
          onViewCourses={() => go("courses", screen.id)}
          onViewCourse={(courseId) => go("course", courseId)}
        />
      )}

      {screen.page === "courses" && screen.id !== undefined && (
        <Courses
          programId={screen.id}
          onBack={() => go("program", screen.id)}
          onSelectCourse={(courseId) => go("course", courseId)}
        />
      )}

      {screen.page === "course" && screen.id !== undefined && (
        <CourseView
          courseId={screen.id}
          onBack={() => go("courses", screen.id)}
          // Removed onViewLessons/onViewAssignments if not needed — add back if component accepts them
        />
      )}

      {screen.page === "lessons" && screen.id !== undefined && (
        <LessonsList
          courseId={screen.id} // assuming LessonsList accepts courseId (or change to id if it expects that)
          onBack={() => go("course", screen.id)}
        />
      )}

      {screen.page === "assignments" && screen.id !== undefined && (
        <AssignmentsList
          courseId={screen.id} // assuming AssignmentsList accepts courseId
          onBack={() => go("course", screen.id)}
        />
      )}

      {screen.page === "progress" && screen.id !== undefined && (
        <Progress
          courseId={screen.id} // assuming Progress accepts courseId
          onBack={() => go("course", screen.id)}
        />
      )}

      {screen.page === "submit" && screen.id !== undefined && (
        <SubmitModal
          lessonId={screen.id} // assuming SubmitModal accepts lessonId
          onBack={() => go("assignments", screen.id)}
        />
      )}
    </div>
  );
}