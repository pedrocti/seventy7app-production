import React, { useState } from "react";
import { LearningAPI } from "@/api/learning";

export default function SubmitModal({ assignment, onClose, onSubmitted, headers }: any) {
  const [text, setText] = useState("");

  const submit = async () => {
    try {
      await LearningAPI.submitAssignment(assignment.id, text, headers);
      alert("Assignment submitted!");
      onSubmitted();
    } catch (err) {
      alert("Failed to submit assignment");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
      <div className="bg-[#071029] p-6 rounded w-full max-w-lg border border-[#0F172A]">
        <h2 className="text-xl font-bold mb-3 text-white">{assignment.title}</h2>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-40 p-3 rounded bg-[#0F172A] text-white border border-gray-700"
          placeholder="Write your assignment..."
        />

        <div className="mt-4 flex gap-3">
          <button
            onClick={submit}
            className="px-4 py-2 bg-[#0AEFFF] text-black rounded"
          >
            Submit
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 rounded text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
