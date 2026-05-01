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
  });

  const go = (page: Page, id?: number) =>
    setScreen({ page, id });

  return (
    <div className="w-full h-full">
      {screen.page === "programs" && (
        <ProgramsList
          onSelect={(id) => go("program", id)}
        />
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
          onBack={() => go("courses", screen.id)}
          onSelectCourse={(courseId) => go("course", courseId)}
        />
      )}

      {screen.page === "course" && screen.id !== undefined && (
        <CourseView
          courseId={screen.id}
          onBack={() => go("courses", screen.id)}
        />
      )}

      {screen.page === "progress" && screen.id !== undefined && (
        <Progress
          courseId={screen.id}
          onBack={() => go("course", screen.id)}
        />
      )}
    </div>
  );
}
