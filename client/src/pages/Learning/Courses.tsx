import React from "react";
import { LearningAPI } from "@/api/learning";

export default function Courses({ courses, onSelectCourse, refresh, headers }: any) {

  const enroll = async (courseId: number) => {
    try {
      await LearningAPI.enroll(courseId, headers);
      alert("Enrollment successful!");
      refresh();
    } catch (err: any) {
      alert(err?.response?.data?.error || "Enroll failed");
    }
  };

  return (
    <div className="grid gap-4">
      {courses.length === 0 ? (
        <div className="p-4 text-gray-400 bg-[#071029] rounded border border-[#0F172A]">
          No courses available.
        </div>
      ) : (
        courses.map((c: any) => (
          <div key={c.id} className="p-4 bg-[#071029] rounded border border-[#0F172A]">
            <div className="font-semibold">{c.title}</div>
            <div className="text-sm text-gray-400">{c.description}</div>

            <div className="mt-2 flex gap-2">
              <button
                className="px-3 py-1 bg-[#0AEFFF] text-black rounded"
                onClick={() => enroll(c.id)}
              >
                Enroll
              </button>

              <button
                className="px-3 py-1 bg-[#0AEFFF]/80 text-black rounded"
                onClick={() => onSelectCourse(c)}
              >
                View Lessons
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
