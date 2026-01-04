import React, { useState, useEffect } from "react";
import { Program } from "@/types/admin";
import { ProgramsAPI } from "@/api/admin/programs";

type Props = {
  token: string;
};

export default function ProgramsColumn({ token }: Props) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({ title: "", price: "", duration: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [draft, setDraft] = useState<Partial<Program> | null>(null);

  const loadPrograms = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ProgramsAPI.getPrograms(token);
      setPrograms(data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load programs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPrograms(); }, []);

  const createProgram = async () => {
    if (!form.title.trim()) return alert("Program title required");
    try {
      const newProgram = await ProgramsAPI.createProgram(token, {
        title: form.title.trim(),
        price: form.price ? Number(form.price) : undefined,
        duration: form.duration || undefined,
      });
      setPrograms([...programs, newProgram]);
      setForm({ title: "", price: "", duration: "" });
    } catch (err) {
      console.error(err);
      alert("Failed to create program");
    }
  };

  const startEdit = (p: Program) => {
    setEditingId(p.id);
    setDraft({ ...p });
  };

  const cancelEdit = () => { setEditingId(null); setDraft(null); };

  const saveEdit = async () => {
    if (!editingId || !draft) return;
    try {
      await ProgramsAPI.updateProgram(token, editingId, {
        title: draft.title!,
        price: draft.price,
        duration: draft.duration,
      });
      setPrograms(programs.map(p => (p.id === editingId ? { ...p, ...draft } : p)));
      cancelEdit();
    } catch (err) {
      console.error(err);
      alert("Failed to update program");
    }
  };

  const deleteProgram = async (programId: number) => {
    if (!confirm("Delete this program?")) return;
    try {
      await ProgramsAPI.deleteProgram(token, programId);
      setPrograms(programs.filter(p => p.id !== programId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete program");
    }
  };

  if (loading) return <div>Loading programs...</div>;
  if (error) return <div className="text-red-400">{error}</div>;

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">Programs ({programs.length})</h3>
      <div className="space-y-3 mb-4">
        {programs.map(p => (
          <div key={p.id} className="p-3 bg-[#071029] rounded border border-[#0F172A]">
            {editingId === p.id && draft ? (
              <div className="space-y-2">
                <input className="w-full p-2 bg-[#0F172A] rounded" value={draft.title || ""} onChange={e => setDraft({ ...draft, title: e.target.value })} />
                <input className="w-full p-2 bg-[#0F172A] rounded" value={draft.price || ""} onChange={e => setDraft({ ...draft, price: Number(e.target.value) })} placeholder="Price" />
                <input className="w-full p-2 bg-[#0F172A] rounded" value={draft.duration || ""} onChange={e => setDraft({ ...draft, duration: e.target.value })} placeholder="Duration" />
                <div className="flex gap-2">
                  <button onClick={saveEdit} className="px-3 py-1 bg-[#0AEFFF] rounded text-black">Save</button>
                  <button onClick={cancelEdit} className="px-3 py-1 bg-gray-600 rounded">Cancel</button>
                </div>
              </div>
            ) : (
              <div>
                <div className="font-medium">{p.title}</div>
                <div className="text-xs text-gray-400">Price: {p.price ?? "N/A"} | Duration: {p.duration ?? "N/A"}</div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => startEdit(p)} className="px-2 py-1 bg-blue-400 rounded text-black">Edit</button>
                  <button onClick={() => deleteProgram(p.id)} className="px-2 py-1 bg-red-500 rounded text-black">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add program */}
      <div className="p-3 bg-[#081022] rounded border border-[#0F172A]">
        <h4 className="font-semibold mb-2">Add Program</h4>
        <input placeholder="Title" className="w-full p-2 bg-[#0F172A] rounded mb-2" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Price" className="w-full p-2 bg-[#0F172A] rounded mb-2" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
        <input placeholder="Duration" className="w-full p-2 bg-[#0F172A] rounded mb-2" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
        <button onClick={createProgram} className="px-3 py-1 bg-[#0AEFFF] rounded text-black">Add Program</button>
      </div>
    </div>
  );
}
