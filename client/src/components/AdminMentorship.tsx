// client/src/components/AdminMentorship.tsx
import { useEffect, useState } from "react";
import { adminFetch } from "../utils/adminFetch"; // <-- make sure path is correct

interface EventItem {
  id: number;
  title: string;
  date: string;
  time: string;
  venue: string;
  link?: string | null;
  description?: string | null;
  price: string;
  is_active: boolean;
  created_at?: string;
}

export default function AdminMentorship() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<Omit<EventItem, "id" | "is_active" | "created_at">>({
    title: "",
    date: "",
    time: "",
    venue: "",
    link: "",
    description: "",
    price: "0",
  });

  // ----------------------------
  // Load events on mount
  // ----------------------------
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await adminFetch("/api/admin/mentorship/events");
      const data = await res.json();

      if (!data.success) throw new Error(data.error || "Failed to load events");

      const formattedEvents = data.events.map((ev: any) => {
        const dateObj = new Date(ev.date);
        return {
          ...ev,
          date: dateObj.toISOString().split("T")[0],
          time: ev.time || dateObj.toTimeString().slice(0, 5),
        };
      });

      setEvents(formattedEvents);
    } catch (err: any) {
      console.error("Failed to fetch mentorship events:", err);
      setError(err.message || "Could not load events");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------
  // Create new event
  // ----------------------------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.title.trim() || !form.date || !form.time || !form.venue.trim()) {
      setError("Title, date, time and venue are required");
      return;
    }

    try {
      const payload = {
        ...form,
        price: form.price.trim() || "0",
      };

      const res = await adminFetch("/api/admin/mentorship/events", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create event");

      await fetchEvents(); // refresh list

      // Reset form
      setForm({
        title: "",
        date: "",
        time: "",
        venue: "",
        link: "",
        description: "",
        price: "0",
      });
    } catch (err: any) {
      setError(err.message || "Failed to create event");
    }
  };

  // ----------------------------
  // Delete event
  // ----------------------------
  const deleteEvent = async (id: number) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const res = await adminFetch(`/api/admin/mentorship/events/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to delete event");

      await fetchEvents(); // refresh list
    } catch (err: any) {
      setError(err.message || "Failed to delete event");
    }
  };

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-semibold mb-4">Create Mentorship Event</h3>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#0B1628] p-6 rounded-xl border border-[#112037] space-y-5"
      >
        {/* Event Title */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Event Title *</label>
          <input
            type="text"
            placeholder="Enter event title"
            className="w-full bg-[#071020] p-3 rounded-lg border border-[#14263F] focus:ring-2 focus:ring-[#0AEFFF] outline-none"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Date *</label>
            <input
              type="date"
              className="w-full bg-[#071020] p-3 rounded-lg border border-[#14263F] focus:ring-2 focus:ring-[#0AEFFF] outline-none"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Time *</label>
            <input
              type="time"
              className="w-full bg-[#071020] p-3 rounded-lg border border-[#14263F] focus:ring-2 focus:ring-[#0AEFFF] outline-none"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Venue */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Venue / Platform *</label>
          <input
            type="text"
            placeholder="Physical address or Zoom / Discord name"
            className="w-full bg-[#071020] p-3 rounded-lg border border-[#14263F] focus:ring-2 focus:ring-[#0AEFFF] outline-none"
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            required
          />
        </div>

        {/* Link */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Meeting Link (optional)</label>
          <input
            type="url"
            placeholder="https://zoom.us/j/..."
            className="w-full bg-[#071020] p-3 rounded-lg border border-[#14263F] focus:ring-2 focus:ring-[#0AEFFF] outline-none"
            value={form.link ?? ""}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
        </div>

        {/* Price */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Price (USD) – 0 = free</label>
          <input
            type="text"
            placeholder="0 or 49.99"
            className="w-full bg-[#071020] p-3 rounded-lg border border-[#14263F] focus:ring-2 focus:ring-[#0AEFFF] outline-none"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
          <p className="text-xs text-gray-500">Use 0 for free events</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Event Description</label>
          <textarea
            placeholder="Write a brief description of this mentorship event..."
            className="w-full bg-[#071020] p-3 rounded-lg border border-[#14263F] focus:ring-2 focus:ring-[#0AEFFF] outline-none h-32 resize-none"
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#0AEFFF] text-black font-semibold py-3 rounded-lg hover:brightness-110 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Creating..." : "Add Event"}
        </button>
      </form>

      {/* EVENTS LIST */}
      <h3 className="text-xl font-semibold mt-10">Upcoming Events</h3>

      {loading && <p className="text-gray-400">Loading events...</p>}

      {!loading && events.length === 0 && (
        <p className="text-gray-500">No mentorship events created yet.</p>
      )}

      <div className="space-y-4">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="bg-[#0B1628] p-5 rounded-xl border border-[#112037] space-y-2"
          >
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-lg">{ev.title}</h4>
              <span
                className={`text-xs px-2 py-1 rounded-full ${
                  ev.price === "0" || ev.price === "0.00"
                    ? "bg-green-900/40 text-green-400"
                    : "bg-amber-900/40 text-amber-400"
                }`}
              >
                {ev.price === "0" || ev.price === "0.00" ? "Free" : `$${ev.price}`}
              </span>
            </div>

            <p className="text-gray-400 text-sm">
              {ev.date} • {ev.time}
            </p>
            <p className="text-gray-300">Venue: {ev.venue}</p>

            {ev.link && (
              <p className="text-[#0AEFFF]">
                <a href={ev.link} target="_blank" rel="noopener noreferrer" className="underline">
                  Join →
                </a>
              </p>
            )}

            {ev.description && <p className="text-gray-400 mt-2">{ev.description}</p>}

            <button
              onClick={() => deleteEvent(ev.id)}
              className="text-red-400 hover:text-red-300 hover:underline text-sm mt-3 block"
            >
              Delete Event
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
