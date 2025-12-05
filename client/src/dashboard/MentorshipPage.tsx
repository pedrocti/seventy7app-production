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

export default function MentorshipPage() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem("mentorship_events");
    if (saved) setEvents(JSON.parse(saved));
  }, []);

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-4">Mentorship Events</h2>

      {events.length === 0 && (
        <p className="text-gray-400">No mentorship events available.</p>
      )}

      <div className="space-y-4">
        {events.map((ev) => (
          <div key={ev.id} className="bg-[#0B1628] p-5 rounded-xl border border-[#112037]">
            <h3 className="text-xl font-bold">{ev.title}</h3>
            <p className="text-gray-400">
              {ev.date} • {ev.time}
            </p>
            <p className="text-gray-300 mt-1">
              Venue: {ev.venue}
            </p>

            {ev.link && (
              <a
                href={ev.link}
                target="_blank"
                className="text-[#0AEFFF] underline block mt-2"
              >
                Join Class →
              </a>
            )}

            <p className="text-gray-400 mt-2">{ev.description}</p>

            <button className="mt-4 px-4 py-2 bg-[#0AEFFF] text-black rounded">
              Apply to Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
