// SubmitModal.tsx
import React, { useState } from "react";
import { LearningAPI } from "@/api/learning";
import { toast } from "sonner";

interface Assignment {
  id: number;
  title: string;
  description?: string;
  my_submission?: {
    content?: string;
    status?: "pending" | "graded" | "rejected";
    grade?: number | null;
    submitted_at: string;
    feedback?: string;
  };
}

interface SubmitModalProps {
  assignment: Assignment;
  onClose: () => void;
  onSubmitted: () => void;
  headers?: Record<string, string>;
  onBack?: () => void;
}

export default function SubmitModal({
  assignment,
  onClose,
  onSubmitted,
  headers,
  onBack,
}: SubmitModalProps) {
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const maxLength = 5000;

  const submission = assignment.my_submission;
  const isSubmitted = !!submission;
  const status = submission?.status || "pending";
  const isRejected = status === "rejected";

  // Allow editing only if not submitted OR rejected
  const canSubmit = !isSubmitted || isRejected;

  const handleSubmit = async () => {
    if (!text.trim()) {
      toast.error("Please write something before submitting");
      return;
    }

    setSubmitting(true);
    try {
      await LearningAPI.submitAssignment(assignment.id, text);

      toast.success(
        isRejected
          ? "Assignment resubmitted successfully!"
          : "Assignment submitted successfully!"
      );
      onSubmitted();
      onClose();
    } catch (err: any) {
      // With backend fix, this should only trigger on real errors
      toast.error(
        err.response?.data?.error || "Failed to submit. Please try again."
      );
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#071029] rounded-xl w-full max-w-lg border border-[#0F172A] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#0F172A] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">{assignment.title}</h2>
            {assignment.description && (
              <p className="text-sm text-gray-400 mt-2">{assignment.description}</p>
            )}
          </div>
          {onBack && (
            <button
              onClick={onBack}
              className="text-sm text-gray-400 hover:text-white transition"
            >
              Back
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-6">
          {canSubmit ? (
            <>
              {isRejected && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 font-medium">Needs Revision</p>
                  {submission.feedback && (
                    <p className="text-sm text-red-300 mt-2">{submission.feedback}</p>
                  )}
                  <p className="text-sm text-gray-300 mt-2">
                    Please review the feedback and resubmit an improved version.
                  </p>
                </div>
              )}

              <div className="relative">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  className="w-full h-48 p-4 rounded-lg bg-[#0F172A] text-white border border-gray-700 focus:border-[#0AEFFF] focus:outline-none resize-none"
                  placeholder="Write your assignment here..."
                  maxLength={maxLength}
                  disabled={submitting}
                />
                <div className="absolute bottom-2 right-3 text-xs text-gray-500">
                  {text.length} / {maxLength}
                </div>
              </div>
            </>
          ) : (
            // Already submitted — show friendly confirmation
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                You have already submitted this assignment
              </h3>
              <p className="text-gray-400 mb-4">
                Submitted on: {new Date(submission.submitted_at).toLocaleString()}
              </p>
              {status === "graded" && submission.grade != null && (
                <p className="text-2xl font-bold text-[#0AEFFF] mb-4">
                  Grade: {submission.grade}%
                </p>
              )}
              <p className="text-sm text-gray-500">
                Your submission is {status === "pending" ? "awaiting review" : "reviewed"}.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-[#0F172A] flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50"
          >
            {canSubmit ? "Cancel" : "Close"}
          </button>

          {canSubmit && (
            <button
              onClick={handleSubmit}
              disabled={submitting || !text.trim()}
              className={`
                px-5 py-2 rounded-lg font-medium transition
                bg-[#0AEFFF] text-black hover:bg-cyan-300
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {submitting ? "Submitting..." : isRejected ? "Resubmit Assignment" : "Submit Assignment"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}