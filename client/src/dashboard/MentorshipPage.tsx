import { motion } from "framer-motion";

export default function MentorshipPage() {
  const events = [
    {
      id: 1,
      title: "Mastering Market Psychology",
      date: "Nov 15, 2025",
      location: "Lagos, Nigeria",
      speaker: "Michael O.",
    },
    {
      id: 2,
      title: "Crypto Trading Bootcamp",
      date: "Dec 1, 2025",
      location: "Online Session",
      speaker: "77Kapital Mentorship Team",
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-[#0AEFFF]"
      >
        Mentorship & Events
      </motion.h1>

      <div className="grid md:grid-cols-2 gap-6">
        {events.map((ev) => (
          <motion.div
            key={ev.id}
            whileHover={{ scale: 1.02 }}
            className="bg-[#0F172A]/60 p-6 rounded-2xl border border-[#1E293B]/40"
          >
            <h2 className="font-semibold text-lg mb-1 text-[#0AEFFF]">{ev.title}</h2>
            <p className="text-sm text-gray-400 mb-2">{ev.date} • {ev.location}</p>
            <p className="text-sm text-gray-300 mb-4">Speaker: {ev.speaker}</p>
            <button className="bg-[#0AEFFF] text-[#0F172A] font-semibold px-4 py-2 rounded-full hover:scale-105 transition">
              Join Session
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
