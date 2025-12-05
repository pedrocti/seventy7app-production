import { useEffect, useState } from "react";

export default function PlanForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: any;
  onSave: (vals: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || "");
  const [minAmount, setMinAmount] = useState<number>(
    initial?.min_amount !== undefined ? Number(initial.min_amount) : 100
  );
  const [maxAmount, setMaxAmount] = useState<number | null>(
    initial?.max_amount !== null && initial?.max_amount !== undefined
      ? Number(initial.max_amount)
      : null
  );
  const [description, setDescription] = useState(initial?.description || "");
  const [durationDays, setDurationDays] = useState<number>(
    initial?.duration_days !== undefined ? Number(initial.duration_days) : 30
  );

  // Reset form when initial changes (edit mode)
  useEffect(() => {
    setName(initial?.name || "");
    setMinAmount(initial?.min_amount !== undefined ? Number(initial.min_amount) : 100);
    setMaxAmount(
      initial?.max_amount !== null && initial?.max_amount !== undefined
        ? Number(initial.max_amount)
        : null
    );
    setDescription(initial?.description || "");
    setDurationDays(initial?.duration_days !== undefined ? Number(initial.duration_days) : 30);
  }, [initial]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      alert("Plan name is required");
      return;
    }
    if (minAmount <= 0) {
      alert("Minimum amount must be greater than 0");
      return;
    }
    if (durationDays <= 0) {
      alert("Duration must be greater than 0 days");
      return;
    }

    onSave({
      name: name.trim(),
      min_amount: minAmount,
      max_amount: maxAmount,
      description: description.trim(),
      duration_days: durationDays,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6 text-white">
      {/* NAME */}
      <div className="space-y-2">
        <label className="text-sm text-gray-300">Plan Name *</label>
        <input
          className="form-input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="e.g. Gold Plan"
        />
      </div>

      {/* AMOUNT RANGE */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Min Amount *</label>
          <input
            className="form-input"
            type="number"
            min="1"
            value={minAmount}
            onChange={(e) => setMinAmount(Number(e.target.value) || 0)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Max Amount (optional)</label>
          <input
            className="form-input"
            type="number"
            min="1"
            value={maxAmount ?? ""}
            onChange={(e) => {
              const val = e.target.value;
              setMaxAmount(val === "" ? null : Number(val));
            }}
            placeholder="No limit if empty"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Duration (days) *</label>
          <input
            className="form-input"
            type="number"
            min="1"
            value={durationDays}
            onChange={(e) => setDurationDays(Number(e.target.value) || 0)}
            required
          />
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-2">
        <label className="text-sm text-gray-300">Description</label>
        <textarea
          className="form-textarea h-32"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe this investment plan..."
        />
      </div>

      {/* BUTTONS */}
      <div className="flex gap-4 pt-6">
        <button
          type="submit"
          className="px-6 py-2.5 bg-[#0AEFFF] text-black font-bold rounded-lg hover:opacity-90 transition"
        >
          {initial ? "Update Plan" : "Create Plan"}
        </button>
        {initial && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
