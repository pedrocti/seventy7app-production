// client/src/admin/learning/AdminProgramsList.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Edit2, Trash2, Save, X, BookOpen } from "lucide-react";

interface Program {
  id: number;
  title: string;
  description: string | null;
  price: string;
  duration_days: number;
}

interface Props {
  programs: Program[];
  selectedProgram: Program | null;
  programForm: { title: string; description: string; price: string; duration_days: string };
  editingProgramId: number | null;
  setProgramForm: React.Dispatch<React.SetStateAction<{ title: string; description: string; price: string; duration_days: string }>>;
  setEditingProgramId: React.Dispatch<React.SetStateAction<number | null>>;
  handleProgramSubmit: (e: React.FormEvent) => Promise<void>;
  startProgramEdit: (p: Program) => void;
  handleDeleteProgram: (id: number) => Promise<void>;
  viewProgram: (p: Program) => void;
}

export default function AdminProgramsList({
  programs,
  selectedProgram,
  programForm,
  editingProgramId,
  setProgramForm,
  setEditingProgramId,
  handleProgramSubmit,
  startProgramEdit,
  handleDeleteProgram,
  viewProgram,
}: Props) {
  const cancelEdit = () => {
    setEditingProgramId(null);
    setProgramForm({ title: "", description: "", price: "0", duration_days: "30" });
  };

  return (
    <div className="space-y-16">
      {/* Create/Edit Form */}
      <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl p-12 border border-[#334155] shadow-2xl">
        <h2 className="text-4xl font-bold text-[#0AEFFF] mb-10">
          {editingProgramId ? "Edit Program" : "Create New Program"}
        </h2>
        <form onSubmit={handleProgramSubmit} className="grid md:grid-cols-2 gap-10">
          <div className="space-y-4">
            <label className="text-gray-300 text-lg font-medium">Program Title *</label>
            <Input
              value={programForm.title}
              onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
              placeholder="e.g. Advanced Crypto Trading Mastery"
              className="bg-[#0F172A] border-[#334155] text-white text-lg py-6 focus:ring-4 focus:ring-[#0AEFFF]"
              required
            />
          </div>
          <div className="space-y-4">
            <label className="text-gray-300 text-lg font-medium">Price (USD)</label>
            <div className="relative">
              <span className="absolute left-6 top-1/2 -translate-y-1/2 text-2xl text-[#0AEFFF]">$</span>
              <Input
                type="number"
                step="0.01"
                value={programForm.price}
                onChange={(e) => setProgramForm({ ...programForm, price: e.target.value })}
                placeholder="99.99"
                className="pl-14 bg-[#0F172A] border-[#334155] text-white text-2xl py-6"
              />
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-gray-300 text-lg font-medium">Duration (days)</label>
            <div className="relative">
              <Input
                type="number"
                value={programForm.duration_days}
                onChange={(e) => setProgramForm({ ...programForm, duration_days: e.target.value })}
                placeholder="30"
                className="pr-20 bg-[#0F172A] border-[#334155] text-white text-lg py-6"
              />
              <span className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400">days</span>
            </div>
          </div>
          <div className="md:col-span-2 space-y-4">
            <label className="text-gray-300 text-lg font-medium">Description</label>
            <textarea
              value={programForm.description}
              onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
              placeholder="What will students learn? Who is this for? Key benefits..."
              rows={6}
              className="w-full p-6 bg-[#0F172A] border border-[#334155] rounded-2xl text-white text-lg 
                       placeholder:text-gray-500 focus:ring-4 focus:ring-[#0AEFFF]/50 resize-none"
            />
          </div>
          <div className="md:col-span-2 flex gap-6">
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#0AEFFF] to-cyan-400 text-black font-bold text-2xl py-8 
                       hover:from-cyan-400 hover:to-cyan-300 shadow-2xl transform hover:scale-105 transition-all"
            >
              {editingProgramId ? "Update Program" : "Create Program"}
            </Button>
            {editingProgramId && (
              <Button
                type="button"
                variant="outline"
                onClick={cancelEdit}
                className="px-12 border-gray-500 text-gray-300 hover:bg-[#334155] text-xl py-8"
              >
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* Programs List */}
      <div className="space-y-10">
        <h2 className="text-4xl font-bold text-[#0AEFFF] text-center">All Programs</h2>
        {programs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-32 h-32 text-gray-600 mx-auto mb-8" />
            <p className="text-3xl text-gray-500">No programs created yet</p>
            <p className="text-xl text-gray-600 mt-4">Create your first premium program above!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {programs.map((p) => (
              <div
                key={p.id}
                className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl p-10 border border-[#334155] cursor-pointer hover:border-[#0AEFFF] transition-all"
                onClick={() => viewProgram(p)}
              >
                <h3 className="text-2xl font-bold text-white mb-4">{p.title}</h3>
                <div className="space-y-3 text-gray-300 mb-8">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-[#0AEFFF]">${p.price}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{p.duration_days} days access</span>
                  </div>
                </div>
                {p.description && <p className="text-gray-400 mb-8">{p.description}</p>}
                <div className="flex gap-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      startProgramEdit(p);
                    }}
                    className="flex-1 bg-[#0F172A] border border-[#0AEFFF] text-[#0AEFFF] hover:bg-[#0AEFFF]/10 font-bold"
                  >
                    <Edit2 className="mr-2 w-5 h-5" />
                    Edit
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProgram(p.id);
                    }}
                    variant="destructive"
                    className="flex-1 font-bold"
                  >
                    <Trash2 className="mr-2 w-5 h-5" />
                    Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}