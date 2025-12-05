import { useEffect, useState } from "react";

interface EventItem {
  id: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  link: string;
  description: string;
}

export default function AdminMentorship() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState<EventItem>({
    id: "",
    title: "",
    date: "",
    time: "",
    venue: "",
    link: "",
    description: "",
  });

  // Load events from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("mentorship_events");
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  const saveEvents = (list: EventItem[]) => {
    localStorage.setItem("mentorship_events", JSON.stringify(list));
    setEvents(list);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newEvent = { ...form, id: crypto.randomUUID() };
    saveEvents([...events, newEvent]);

    // Reset form
    setForm({
      id: "",
      title: "",
      date: "",
      time: "",
      venue: "",
      link: "",
      description: "",
    });
  };

  const deleteEvent = (id: string) => {
    saveEvents(events.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">

      <h3 className="text-2xl font-semibold mb-4">Create Mentorship Event</h3>

      {/* FORM */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#0B1628] p-6 rounded-xl border border-[#112037] space-y-5"
      >
        <div className="space-y-2">
          <label className="text-sm text-gray-300">Event Title</label>
          <input
            type="text"
            placeholder="Enter event title"
            className="w-full bg-[#071020] p-3 rounded-lg border border-[#14263F] focus:ring-2 focus:ring-[#0AEFFF] outline-none"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Date</label>
            <input
              type="date"
              className="w-full bg-[#071020] p-3 rounded-lg border border-[#14263F] focus:ring-2 focus:ring-[#0AEFFF] outline-none"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Time</label>
            <input
              type="time"
              className="w-full bg-[#071020] p-3 rounded-lg border border-[#14263F] focus:ring-2 focus:ring-[#0AEFFF] outline-none"
              value={form.time}
              onChange={(e) => setForm({ ...form, time: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-300">Venue</label>
          <input
            type="text"
            placeholder="Physical address or virtual meeting venue"
            className="w-full bg-[#071020] p-3 rounded-lg border border-[#14263F] focus:ring-2 focus:ring-[#0AEFFF] outline-none"
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-300">Meeting / Class Link</label>
          <input
            type="text"
            placeholder="Zoom / Google Meet / Discord link"
            className="w-full bg-[#071020] p-3 rounded-lg border border-[#14263F] focus:ring-2 focus:ring-[#0AEFFF] outline-none"
            value={form.link}
            onChange={(e) => setForm({ ...form, link: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-300">Event Description</label>
          <textarea
            placeholder="Write a brief description of this mentorship event..."
            className="w-full bg-[#071020] p-3 rounded-lg border border-[#14263F] focus:ring-2 focus:ring-[#0AEFFF] outline-none h-32 resize-none"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />
        </div>

        <button className="w-full bg-[#0AEFFF] text-black font-semibold py-3 rounded-lg hover:brightness-110 transition">
          Add Event
        </button>
      </form>

      {/* EVENTS LIST */}
      <h3 className="text-xl font-semibold mt-10">Upcoming Events</h3>

      {events.length === 0 && (
        <p className="text-gray-500">No mentorship events created yet.</p>
      )}

      <div className="space-y-4">
        {events.map((ev) => (
          <div
            key={ev.id}
            className="bg-[#0B1628] p-5 rounded-xl border border-[#112037] space-y-2"
          >
            <h4 className="font-bold text-lg">{ev.title}</h4>

            <p className="text-gray-400 text-sm">
              {ev.date} • {ev.time}
            </p>

            <p className="text-gray-300">Venue: {ev.venue}</p>

            {ev.link && (
              <p className="text-[#0AEFFF]">
                <a href={ev.link} target="_blank" className="underline">
                  Join Class →
                </a>
              </p>
            )}

            <p className="text-gray-400">{ev.description}</p>

            <button
              onClick={() => deleteEvent(ev.id)}
              className="text-red-400 hover:underline text-sm mt-2"
            >
              Delete Event
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
