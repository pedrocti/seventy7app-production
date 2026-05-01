import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  BookOpen,
  Clock,
  Star,
  Zap,
  ArrowRight,
} from "lucide-react";

interface Program {
  id: number;
  title: string;
  description: string | null;
  price: string;
  duration_days: number;
}

export default function ProgramsList({
  onSelect,
}: {
  onSelect: (id: number) => void;
}) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [purchased, setPurchased] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const res = await fetch("/api/learning/programs", { headers });
        const data = await res.json();

        if (data.success) {
          setPrograms(data.programs || []);
          setPurchased(data.purchased || []);
        } else {
          toast.error(data.error || "Failed to load programs");
        }
      } catch (err) {
        toast.error("Failed to load programs");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  /**
   * Handles free, paid, and already purchased programs
   * - Deducts balance if needed
   * - Shows insufficient balance if user cannot afford
   * - Grants access after payment
   */
  const accessOrBuy = async (program: Program) => {
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please log in");

    const price = Number(program.price);

    try {
      // Only attempt to buy if not free and not purchased
      if (!purchased.includes(program.id) && price > 0) {
        const res = await fetch(`/api/learning/programs/buy/${program.id}`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (!res.ok) return toast.error(data.error || "Payment failed");
        if (!data.success) return toast.error(data.error || "Insufficient balance");

        toast.success("Payment successful! Access granted 🚀");
        setPurchased((prev) => [...prev, program.id]);
      }

      // Access program after payment or if free/purchased
      onSelect(program.id);

    } catch (err) {
      toast.error("Network error");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#020617] to-[#0F172A] flex items-center justify-center">
        <div className="text-center animate-pulse">
          <BookOpen className="w-16 h-16 text-[#0AEFFF] mx-auto mb-4" />
          <p className="text-2xl text-gray-300">
            Loading premium programs...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0B1628] to-[#020617]">

      {/* Hero Section */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0AEFFF] to-cyan-300 mb-6">
            Unlock Your Potential
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Join successful learners, traders and investors through our premium certified programs.
          </p>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <h2 className="text-4xl font-bold text-center text-[#0AEFFF] mb-16">
          Premium Mentorship Programs
        </h2>

        {programs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-24 h-24 text-gray-600 mx-auto mb-6" />
            <p className="text-2xl text-gray-400">
              No programs available yet
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {programs.map((p) => (
              <div
                key={p.id}
                className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-3xl p-10 border border-[#334155]
                           hover:border-[#0AEFFF] hover:shadow-2xl hover:shadow-[#0AEFFF]/20
                           transition-all duration-300 flex flex-col"
              >
                <div className="flex-grow space-y-6">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="text-sm text-cyan-300 uppercase">
                        Premium
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-white">
                      {p.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-gray-400">
                    <Clock className="w-5 h-5" />
                    <span>{p.duration_days} days full access</span>
                  </div>

                  {p.description && (
                    <div className="text-gray-300 line-clamp-3">
                      {p.description}
                    </div>
                  )}

                  {/* Instead of modal — go to full page */}
                  {p.description && (
                    <button
                      onClick={() => onSelect(p.id)}
                      className="text-[#0AEFFF] hover:text-cyan-200 font-medium flex items-center gap-2"
                    >
                      View Full Details
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="pt-6 border-t border-[#334155] mt-8">
                  <p className="text-4xl font-bold text-[#0AEFFF] mb-6">
                    {p.price === "0.00" ? "FREE" : `$${p.price}`}
                  </p>

                  <Button
                    onClick={() => accessOrBuy(p)}
                    className="w-full bg-gradient-to-r from-[#0AEFFF] to-cyan-400 text-black font-bold text-lg py-6 hover:scale-105 transition"
                  >
                    {Number(p.price) === 0 || purchased.includes(p.id)
                      ? "Access Program"
                      : "Buy & Access"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}