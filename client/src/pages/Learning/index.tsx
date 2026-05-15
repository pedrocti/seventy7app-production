// client/src/pages/Learning/index.tsx
// ─────────────────────────────────────────────────────────────────────────────
// State-machine router — no URL routing needed since Learning is rendered
// inside the dashboard as a component, not via browser navigation.
// ─────────────────────────────────────────────────────────────────────────────
import { useState } from 'react';
import ProgramsList from './ProgramsList';
import ProgramView  from './ProgramView';
import CourseView   from './CourseView';

type View =
  | { type: 'programs' }
  | { type: 'program';  programId: number }
  | { type: 'course';   courseId: number; programId?: number };

export default function LearningRouter() {
  const [view, setView] = useState<View>({ type: 'programs' });

  function navigate(v: View) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setView(v);
  }

  if (view.type === 'programs') {
    return (
      <ProgramsList
        onSelect={programId => navigate({ type: 'program', programId })}
      />
    );
  }

  if (view.type === 'program') {
    return (
      <ProgramView
        id={view.programId}
        onBack={() => navigate({ type: 'programs' })}
        onViewCourse={courseId => navigate({ type: 'course', courseId, programId: view.programId })}
      />
    );
  }

  if (view.type === 'course') {
    return (
      <CourseView
        courseId={view.courseId}
        onBack={() =>
          view.programId
            ? navigate({ type: 'program', programId: view.programId })
            : navigate({ type: 'programs' })
        }
      />
    );
  }

  return null;
}