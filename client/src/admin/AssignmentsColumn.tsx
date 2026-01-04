import React, { useState } from "react";
import { Assignment } from "@/types/admin";
import { AssignmentsAPI } from "@/api/admin";

type Props = {
  assignments: Assignment[];
  setAssignments: React.Dispatch<React.SetStateAction<Assignment[]>>;
  courseId: number;
  token: string;
};

export default function AssignmentsColumn({ assignments, setAssignments, courseId, token }: Props) {
  const [form, setForm] = useState({ title: "", description: "", due_date: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<Assignment> | null>(null);

  const dateInputToISO = (dateStr: string | undefined | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d.toISOString();
  };

  const addAssignment = async () => {
    if (!form.title.trim()) return alert("Assignment title required");
    try {
      const newAssignment = await AssignmentsAPI.addAssignment(token, courseId, {
        title: form.title.trim(),
        description: form.description.trim() || "",
        due_date: dateInputToISO(form.due_date),
      });
      setAssignments([...assignments, newAssignment]);
      setForm({ title: "", description: "", due_date: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to add assignment");
    }
  };

  const startEdit = (a: Assignment) => {
    setEditingId(a.id);
    setDraft({
      ...a,
      due_date: a.due_date ? a.due_date.slice(0, 10) : "",
    });
  };

  const cancelEdit = () => { setEditingId(null); setDraft(null); };

  const saveEdit = async () => {
    if (!editingId || !draft) return;
    try {
      await AssignmentsAPI.updateAssignment(token, courseId, editingId, {
        title: draft.title!,
        description: draft.description || "",
        due_date: draft.due_date ? dateInputToISO(draft.due_date) : null,
      });
      setAssignments(assignments.map(a => (a.id === editingId ? { ...a, ...draft, due_date: draft.due_date ? dateInputToISO(draft.due_date) : null } : a)));
      cancelEdit();
    } catch (err) {
      console.error(err);
      alert("Failed to update assignment");
    }
  };

  const deleteAssignment = async (assignmentId: number) => {
    if (!confirm("Delete this assignment?")) return;
    try {
      await AssignmentsAPI.deleteAssignment(token, courseId, assignmentId);
      setAssignments(assignments.filter(a => a.id !== assignmentId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete assignment");
    }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">Assignments ({assignments.length})</h3>
      <div className="space-y-3 mb-4">
        {assignments.map(a => (
          <div key={a.id} className="p-3 bg-[#071029] rounded border border-[#0F172A]">
            {editingId === a.id && draft ? (
              <div className="space-y-2">
                <input className="w-full p-2 bg-[#0F172A] rounded" value={draft.title || ""} onChange={e => setDraft({ ...draft, title: e.target.value })} />
                <textarea className="w-full p-2 bg-[#0F172A] rounded" value={draft.description || ""} onChange={e => setDraft({ ...draft, description: e.target.value })} />
                <input type="date" className="w-full p-2 bg-[#0F172A] rounded" value={draft.due_date || ""} onChange={e => setDraft({ ...draft, due_date: e.target.value })} />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="px-3 py-1 bg-[#0AEFFF] rounded text-black">Save</button>
                  <button onClick={cancelEdit} className="px-3 py-1 bg-gray-600 rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-medium">{a.title}</div>
                <div className="text-xs text-gray-400">{a.description}</div>
                <div className="text-xs text-gray-500 mt-1">Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : "No due date"}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => startEdit(a)} className="px-2 py-1 bg-blue-400 rounded text-black">Edit</button>
                  <button onClick={() => deleteAssignment(a.id)} className="px-2 py-1 bg-red-500 rounded text-black">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Assignment */}
      <div className="p-3 bg-[#081022] rounded border border-[#0F172A]">
        <h4 className="font-semibold mb-2">Add Assignment</h4>
        <input placeholder="Title" className="w-full p-2 bg-[#0F172A] rounded mb-2" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <textarea placeholder="Description" className="w-full p-2 bg-[#0F172A] rounded mb-2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        <input type="date" placeholder="Due date" className="w-full p-2 bg-[#0F172A] rounded mb-2" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} />
        <button onClick={addAssignment} className="px-3 py-1 bg-[#0AEFFF] rounded text-black">Add Assignment</button>
      </div>
    </div>
  );
}
