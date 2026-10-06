import React, { useState } from "react";
import { Lesson } from "@/types/admin";
import { LessonsAPI } from "@/api/admin";

type Props = {
  lessons: Lesson[];
  setLessons: React.Dispatch<React.SetStateAction<Lesson[]>>;
  courseId: number;
  token: string;
};

export default function LessonsColumn({ lessons, setLessons, courseId, token }: Props) {
  const [form, setForm] = useState({ title: "", content: "", material_link: "", pdf_url: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<Lesson> | null>(null);

  const addLesson = async () => {
    if (!form.title.trim()) return alert("Lesson title required");
    try {
      const newLesson = await LessonsAPI.addLesson(token, courseId, { ...form, sort_order: lessons.length + 1 });
      setLessons([...lessons, newLesson]);
      setForm({ title: "", content: "", material_link: "", pdf_url: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to add lesson");
    }
  };

  const startEdit = (l: Lesson) => { setEditingId(l.id); setDraft({ ...l }); };
  const cancelEdit = () => { setEditingId(null); setDraft(null); };

  const saveEdit = async () => {
    if (!editingId || !draft) return;
    try {
      await LessonsAPI.updateLesson(token, courseId, editingId, draft);
      setLessons(lessons.map(l => (l.id === editingId ? { ...l, ...draft } : l)));
      cancelEdit();
    } catch (err) { console.error(err); alert("Failed to update lesson"); }
  };

  const deleteLesson = async (lessonId: number) => {
    if (!confirm("Delete this lesson?")) return;
    try {
      await LessonsAPI.deleteLesson(token, courseId, lessonId);
      setLessons(lessons.filter(l => l.id !== lessonId));
    } catch (err) { console.error(err); alert("Failed to delete lesson"); }
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">Lessons ({lessons.length})</h3>
      <div className="space-y-3 mb-4">
        {lessons.map(l => (
          <div key={l.id} className="p-3 bg-[#071029] rounded border border-brand-secondary">
            {editingId === l.id && draft ? (
              <div className="space-y-2">
                <input value={draft.title || ""} onChange={e => setDraft({ ...draft, title: e.target.value })} className="w-full p-2 bg-brand-secondary rounded" />
                <textarea value={draft.content || ""} onChange={e => setDraft({ ...draft, content: e.target.value })} className="w-full p-2 bg-brand-secondary rounded" />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="px-3 py-1 bg-[#0AEFFF] rounded text-black">Save</button>
                  <button onClick={cancelEdit} className="px-3 py-1 bg-gray-600 rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-medium">{l.title}</div>
                <div className="text-xs text-gray-400 my-1">{l.content?.slice(0, 120)}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => startEdit(l)} className="px-2 py-1 bg-blue-400 rounded text-black">Edit</button>
                  <button onClick={() => deleteLesson(l.id)} className="px-2 py-1 bg-red-500 rounded text-black">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Add Lesson */}
      <div className="p-3 bg-[#081022] rounded border border-brand-secondary">
        <h4 className="font-semibold mb-2">Add Lesson</h4>
        <input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full p-2 bg-brand-secondary rounded mb-2" />
        <input placeholder="Material link" value={form.material_link} onChange={e => setForm({ ...form, material_link: e.target.value })} className="w-full p-2 bg-brand-secondary rounded mb-2" />
        <input placeholder="PDF URL" value={form.pdf_url} onChange={e => setForm({ ...form, pdf_url: e.target.value })} className="w-full p-2 bg-brand-secondary rounded mb-2" />
        <textarea placeholder="Short content" value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} className="w-full p-2 bg-brand-secondary rounded mb-2" />
        <button onClick={addLesson} className="px-3 py-1 bg-[#0AEFFF] rounded text-black">Add Lesson</button>
      </div>
    </div>
  );
}
