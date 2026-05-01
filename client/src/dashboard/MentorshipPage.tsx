// dashboard/MentorshipEvents.tsx
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, ExternalLink, Sparkles, Users } from "lucide-react";

interface Event {
  id: number;
  title: string;
  description: string;
  date: string;
  time: string;
  venue: string;
  link: string;
  price: string;
}

export default function MentorshipEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [purchased, setPurchased] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch("/api/mentorship/events", {
          headers: token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : undefined,
        });

        const data = await res.json();

        if (data.success) {
          setEvents(data.events || []);
          setPurchased(data.purchased || []);
        } else {
          toast.error("Failed to load events");
        }
      } catch (err) {
        toast.error("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);


  const buyEvent = async (eventId: number, price: string) => {
    const amount = Number(price);
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please log in to purchase");
      return;
    }

    if (amount > 0 && !confirm(`Pay $${amount} from your balance?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/mentorship/buy/${eventId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(data.message || (amount === 0 ? "Access granted!" : "Payment successful!"));

        setPurchased((prev) => {
          if (prev.includes(eventId)) return prev;
          return [...prev, eventId];
        });
      } else {
        toast.error(data.error || "Payment failed");
      }
    } catch (err) {
      toast.error("Network error — please try again");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-2xl text-[#0AEFFF] font-light"
        >
          Loading exclusive events...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1120] text-white">
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="relative text-center py-10 px-6"
      >
        <Sparkles className="w-10 h-10 text-[#0AEFFF] mx-auto mb-4 animate-pulse" />
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#0AEFFF] to-cyan-300 bg-clip-text text-transparent">
          Exclusive Internship Events
        </h1>
        <p className="text-gray-400 mt-3 text-lg">
          Live • Interactive • Career-Accelerating
        </p>
      </motion.header>

      <section className="relative max-w-5xl mx-auto px-6 pb-16">
        {events.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <Users className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-medium text-gray-400">No events right now</h3>
            <p className="text-gray-500 mt-3">New sessions are added regularly — stay tuned!</p>
          </motion.div>
        ) : (
          <div className="grid gap-6">
            {events.map((ev, index) => (
              <motion.div
                key={ev.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.08 }}
                className="group relative bg-[#0F172A]/80 backdrop-blur-sm border border-[#1E293B]/60 rounded-xl p-6 shadow-lg hover:shadow-[#0AEFFF]/25 hover:border-[#0AEFFF]/50 transition-all duration-400"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white mb-3">{ev.title}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-300 mb-4">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#0AEFFF]" />
                        {new Date(ev.date).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-[#0AEFFF]" />
                        {ev.time}
                      </span>
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[#0AEFFF]" />
                        {ev.venue}
                      </span>
                    </div>
                    <p className="text-gray-300">{ev.description || "Exclusive live mentorship with industry leaders."}</p>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#0AEFFF] mb-4">
                      {ev.price === "0.00" ? "FREE" : `$${ev.price}`}
                    </div>

                    {purchased.includes(ev.id) ? (
                      <a
                        href={ev.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-8 py-3 bg-[#0F172A]/80 backdrop-blur-sm border border-[#1E293B]/60 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                      >
                        Join Now <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <Button
                        onClick={() => buyEvent(ev.id, ev.price)}
                        className="px-10 py-3 bg-[#0F172A]/80 backdrop-blur-sm border border-[#1E293B]/60 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                      >
                        {ev.price === "0.00" ? "Get Access" : "Buy Now"}
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <footer className="relative border-t border-[#334155]/30 py-6 text-center text-gray-600 text-sm">
        © 2025 Your Platform • Transforming Careers Through Expert Guidiance
      </footer>
    </div>
  );
}
