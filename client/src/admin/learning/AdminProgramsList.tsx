// client/src/admin/learning/AdminProgramsList.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit2, Trash2, BookOpen, Clock, DollarSign } from "lucide-react";

interface Program {
  id: number;
  title: string;
  description: string | null;
  price: string;
  duration_days: number;
  thumbnail_url?: string | null;
}

interface Props {
  programs: Program[];
  selectedProgram: Program | null;
  programForm: { title: string; description: string; price: string; duration_days: string; thumbnail_url: string };
  editingProgramId: number | null;
  setProgramForm: React.Dispatch<React.SetStateAction<{ title: string; description: string; price: string; duration_days: string; thumbnail_url: string }>>;
  setEditingProgramId: React.Dispatch<React.SetStateAction<number | null>>;
  handleProgramSubmit: (e: React.FormEvent) => Promise<void>;
  startProgramEdit: (p: Program) => void;
  handleDeleteProgram: (id: number) => Promise<void>;
  viewProgram: (p: Program) => void;
}

export default function AdminProgramsList({
  programs,
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
    setProgramForm({ title: "", description: "", price: "0", duration_days: "30", thumbnail_url: "" });
  };

  const inputStyle = {
    background: "var(--surface)",
    borderColor: "var(--surface-3)",
    color: "var(--text)",
  };

  return (
    <div className="space-y-16">

      {/* ── Create / Edit Form ── */}
      <div
        className="rounded-3xl p-12 border shadow-2xl"
        style={{
          background: "linear-gradient(135deg, var(--surface-4), var(--surface))",
          borderColor: "var(--surface-3)",
        }}
      >
        <h2 className="text-4xl font-bold mb-10" style={{ color: "var(--cyan)" }}>
          {editingProgramId ? "Edit Program" : "Create New Program"}
        </h2>

        <form onSubmit={handleProgramSubmit} className="grid md:grid-cols-2 gap-10">
          {/* Title */}
          <div className="space-y-4">
            <label className="text-lg font-medium" style={{ color: "var(--text-2)" }}>
              Program Title *
            </label>
            <Input
              value={programForm.title}
              onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
              placeholder="e.g. Advanced Crypto Trading Mastery"
              className="text-lg py-6"
              style={inputStyle}
              required
            />
          </div>

          {/* Price */}
          <div className="space-y-4">
            <label className="text-lg font-medium" style={{ color: "var(--text-2)" }}>
              Price (USD) — set 0 for free
            </label>
            <div className="relative">
              <span
                className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold"
                style={{ color: "var(--cyan)" }}
              >
                $
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={programForm.price}
                onChange={(e) => setProgramForm({ ...programForm, price: e.target.value })}
                placeholder="99.99"
                className="pl-10 text-xl py-6"
                style={inputStyle}
              />
            </div>
          </div>

          {/* Duration */}
          <div className="space-y-4">
            <label className="text-lg font-medium" style={{ color: "var(--text-2)" }}>
              Duration (days)
            </label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                value={programForm.duration_days}
                onChange={(e) => setProgramForm({ ...programForm, duration_days: e.target.value })}
                placeholder="30"
                className="pr-16 text-lg py-6"
                style={inputStyle}
              />
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2"
                style={{ color: "var(--muted)" }}
              >
                days
              </span>
            </div>
          </div>

          {/* Thumbnail URL (optional) */}
          <div className="space-y-4">
            <label className="text-lg font-medium" style={{ color: "var(--text-2)" }}>
              Thumbnail URL (optional)
            </label>
            <Input
              value={programForm.thumbnail_url ?? ""}
              onChange={(e) => setProgramForm({ ...programForm, thumbnail_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
              className="text-lg py-6"
              style={inputStyle}
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2 space-y-4">
            <label className="text-lg font-medium" style={{ color: "var(--text-2)" }}>
              Description
            </label>
            <textarea
              value={programForm.description}
              onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
              placeholder="What will students learn? Who is this for? Key benefits..."
              rows={6}
              className="w-full p-6 rounded-2xl text-lg resize-none border"
              style={{
                ...inputStyle,
                outline: "none",
              }}
            />
          </div>

          {/* Submit */}
          <div className="md:col-span-2 flex gap-6">
            <Button
              type="submit"
              className="flex-1 font-bold text-2xl py-8 shadow-2xl hover:scale-105 transition-all border-0"
              style={{
                background: "linear-gradient(to right, var(--cyan), #67e8f9)",
                color: "#000",
              }}
            >
              {editingProgramId ? "Update Program" : "Create Program"}
            </Button>
            {editingProgramId && (
              <Button
                type="button"
                variant="outline"
                onClick={cancelEdit}
                className="px-12 text-xl py-8"
                style={{ borderColor: "var(--surface-3)", color: "var(--text-2)" }}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </div>

      {/* ── Programs List ── */}
      <div className="space-y-10">
        <h2 className="text-4xl font-bold text-center" style={{ color: "var(--cyan)" }}>
          All Programs
        </h2>

        {programs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-32 h-32 mx-auto mb-8" style={{ color: "var(--muted)" }} />
            <p className="text-3xl" style={{ color: "var(--muted)" }}>No programs created yet</p>
            <p className="text-xl mt-4" style={{ color: "var(--muted-2)" }}>
              Create your first premium program above!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {programs.map((p) => (
              <div
                key={p.id}
                className="rounded-3xl p-8 border cursor-pointer hover:scale-[1.01] transition-all"
                style={{
                  background: "linear-gradient(135deg, var(--surface-4), var(--surface))",
                  borderColor: "var(--surface-3)",
                }}
                onClick={() => viewProgram(p)}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor = "var(--cyan)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.borderColor = "var(--surface-3)")
                }
              >
                {p.thumbnail_url && (
                  <img
                    src={p.thumbnail_url}
                    alt={p.title}
                    className="w-full h-40 object-cover rounded-xl mb-6"
                  />
                )}

                <h3 className="text-2xl font-bold mb-4" style={{ color: "var(--text)" }}>
                  {p.title}
                </h3>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2" style={{ color: "var(--cyan)" }}>
                    <DollarSign className="w-4 h-4" />
                    <span className="text-xl font-bold">
                      {Number(p.price) === 0 ? "FREE" : `$${p.price}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2" style={{ color: "var(--muted)" }}>
                    <Clock className="w-4 h-4" />
                    <span>{p.duration_days} days access</span>
                  </div>
                </div>

                {p.description && (
                  <p className="mb-8 line-clamp-3" style={{ color: "var(--text-2)" }}>
                    {p.description}
                  </p>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      startProgramEdit(p);
                    }}
                    className="flex-1 font-bold border"
                    style={{
                      background: "transparent",
                      borderColor: "var(--cyan)",
                      color: "var(--cyan)",
                    }}
                  >
                    <Edit2 className="mr-2 w-4 h-4" />
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
                    <Trash2 className="mr-2 w-4 h-4" />
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
