// AssignmentsList.tsx
import React from "react";
import { AlertCircle } from "lucide-react";

// Define proper types
interface Assignment {
  id: number;
  title: string;
  description?: string;
  due_date?: string;
  my_submission?: {
    submitted_at: string;
    content?: string;
    status?: "pending" | "graded" | "rejected";
    grade?: number | null;
  };
}

// AssignmentsList.tsx
interface AssignmentsListProps {
  assignments: Assignment[];
  onSubmitClick: (assignment: Assignment) => void;
  courseId?: number;
  onBack?: () => void; 
}

export default function AssignmentsList({ assignments, onSubmitClick, courseId }: AssignmentsListProps) {
  // Check if any assignment is unsubmitted
  const hasPending = assignments.some((a) => !a.my_submission);

  return (
    <div className="mb-8 relative">
      {/* Global glowing notification if there are pending assignments */}
      {hasPending && (
        <div className="absolute top-0 right-0 mt-1 mr-1 w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
      )}

      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white flex items-center gap-2">
          Assignments
          {hasPending && <AlertCircle className="w-5 h-5 text-yellow-400 animate-pulse" />}
        </h3>

        {assignments.length > 0 && (
          <span className="text-sm text-gray-400">
            {assignments.filter((a) => a.my_submission).length} / {assignments.length} submitted
          </span>
        )}
      </div>

      {assignments.length === 0 ? (
        <div className="p-6 text-center text-gray-400 bg-[#071029] rounded-lg border border-[#0F172A]">
          No assignments yet in this course.
        </div>
      ) : (
        <ul className="space-y-4">
          {assignments.map((assignment) => {
            const submission = assignment.my_submission;
            const status = submission?.status || "pending";
            const hasSubmission = !!submission;

            return (
              <li
                key={assignment.id}
                className="p-5 bg-[#071029] rounded-lg border border-[#0F172A] hover:border-[#0AEFFF]/50 transition-colors relative"
              >
                {/* Glowing indicator for unsubmitted assignments */}
                {!hasSubmission && (
                  <div className="absolute top-2 right-2 w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                )}

                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h4 className="font-semibold text-white text-lg">{assignment.title}</h4>

                    {assignment.description && (
                      <p className="text-sm text-gray-400 mt-2 leading-relaxed">{assignment.description}</p>
                    )}

                    {assignment.due_date && (
                      <p className="text-xs text-gray-500 mt-2">
                        Due: {new Date(assignment.due_date).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {hasSubmission ? (
                      <div className="text-center">
                        {/* Status badge */}
                        <span
                          className={`
                            text-xs px-3 py-1 rounded-full font-medium
                            ${status === "graded" ? "bg-green-500/20 text-green-400" :
                              status === "rejected" ? "bg-red-500/20 text-red-400" :
                              "bg-yellow-500/20 text-yellow-400"}
                          `}
                        >
                          {status === "graded" ? "Graded" :
                           status === "rejected" ? "Needs Revision" :
                           "Submitted"}
                        </span>

                        {/* Submission timestamp */}
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(submission.submitted_at).toLocaleString()}
                        </p>

                        {/* Grade display */}
                        {submission.grade != null && (
                          <p className="text-sm font-medium text-[#0AEFFF] mt-1">
                            Grade: {submission.grade}%
                          </p>
                        )}

                        {/* Resubmit only if rejected */}
                        {status === "rejected" && (
                          <button
                            onClick={() => onSubmitClick(assignment)}
                            className="mt-2 px-4 py-1 text-xs bg-yellow-500 text-black rounded hover:bg-yellow-400"
                          >
                            Resubmit
                          </button>
                        )}
                      </div>
                    ) : (
                      <button
                        onClick={() => onSubmitClick(assignment)}
                        className="px-4 py-2 bg-[#0AEFFF] text-black rounded font-medium hover:bg-cyan-300 transition"
                      >
                        Submit Assignment
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}