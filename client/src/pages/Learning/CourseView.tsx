import React, { useEffect, useState } from "react";
import { LearningAPI } from "@/api/learning";
import LessonsList from "./LessonsList";
import AssignmentsList from "./AssignmentsList";
import SubmitModal from "./SubmitModal";

export default function CourseView({ course, goBack, headers }: any) {
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [reload, setReload] = useState(false);

  useEffect(() => {
    loadCourseData();
  }, [course, reload]);

  const loadCourseData = async () => {
    const les = await LearningAPI.getLessons(course.id, headers);
    const ass = await LearningAPI.getAssignments(course.id, headers);

    setLessons(les.data.lessons || []);
    setAssignments(ass.data.assignments || []);
  };

  return (
    <div>
      <button
        className="px-3 py-1 bg-[#0AEFFF] text-black rounded mb-4"
        onClick={goBack}
      >
        Back to Courses
      </button>

      <h2 className="text-xl font-bold mb-4">{course.title}</h2>

      <LessonsList lessons={lessons} />

      <AssignmentsList
        assignments={assignments}
        onSubmitClick={setSelectedAssignment}
      />

      {selectedAssignment && (
        <SubmitModal
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          headers={headers}
          onSubmitted={() => {
            setReload(!reload);
            setSelectedAssignment(null);
          }}
        />
      )}
    </div>
  );
}
