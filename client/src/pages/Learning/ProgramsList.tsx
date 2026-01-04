import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { BookOpen, Clock, Trophy, Users, Zap, Shield, Star, ArrowRight, X } from "lucide-react";
interface Program {
  id: number;
  title: string;
  description: string | null;
  price: string;
  duration_days: number;
}
export default function ProgramsList({ onSelect }: { onSelect: (id: number) => void }) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [purchased, setPurchased] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDescription, setSelectedDescription] = useState<string | null>(null);
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
  const buy = async (id: number, price: string) => {
    const amount = Number(price);
    if (amount > 0 && !confirm(`Pay $${amount} from your balance?`)) return;
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Please log in");
    try {
      const res = await fetch(`/api/learning/programs/buy/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Payment successful! Welcome to your journey 🚀");
        setPurchased([...purchased, id]);
      } else {
        toast.error(data.error || "Payment failed");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };
  const openDescription = (desc: string | null) => {
    if (desc) setSelectedDescription(desc);
  };
  const closeDescription = () => setSelectedDescription(null);
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#020617] to-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">
            <BookOpen className="w-16 h-16 text-[#0AEFFF] mx-auto mb-4" />
            <p className="text-2xl text-gray-300">Loading premium programs...</p>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#020617] via-[#0B1628] to-[#020617]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4 sm:py-20 sm:px-6 lg:py-24 lg:px-8 text-center">
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617] opacity-80" />
        <div className="relative max-w-5xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0AEFFF] to-cyan-300 mb-4 sm:mb-6">
            Unlock Your Potential
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-300 mb-6 sm:mb-8 max-w-3xl mx-auto">
            Join other successful learners. traders and investors with our premium certified programs
          </p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mt-8 sm:mt-12">
            <div className="flex items-center gap-3 text-gray-300 text-sm sm:text-base">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              <span>Expert-Led Training</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300 text-sm sm:text-base">
              <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-[#0AEFFF]" />
              <span>Lifetime Access</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300 text-sm sm:text-base">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              <span>100% Secure Payment</span>
            </div>
          </div>
        </div>
      </section>
      {/* Programs Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-12 sm:pb-20">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-[#0AEFFF] mb-10 sm:mb-16">
          Premium Mentorship Programs
        </h2>
        {programs.length === 0 ? (
          <div className="text-center py-12 sm:py-20">
            <BookOpen className="w-20 h-20 sm:w-24 sm:h-24 text-gray-600 mx-auto mb-6" />
            <p className="text-xl sm:text-2xl text-gray-400">No programs available yet</p>
            <p className="text-gray-500 mt-4 text-base sm:text-lg">Check back soon for exclusive training!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {programs.map((p) => (
              <div
                key={p.id}
                className="group relative bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl sm:rounded-3xl p-6 sm:p-10 border border-[#334155]
                           hover:border-[#0AEFFF] hover:shadow-2xl hover:shadow-[#0AEFFF]/30 transition-all duration-500
                           transform hover:-translate-y-2 sm:hover:-translate-y-4 flex flex-col"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-[#0AEFFF]/5 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition" />
                <div className="relative flex-grow space-y-4 sm:space-y-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3 sm:mb-4">
                      <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 fill-current" />
                      <span className="text-xs sm:text-sm text-cyan-300 uppercase tracking-wider">Premium</span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-bold text-white">{p.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4 text-gray-400 text-sm sm:text-base">
                    <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>{p.duration_days} days full access</span>
                  </div>
                  {/* Truncated Description + Read More */}
                  {p.description && (
                    <div className="text-gray-300 text-base sm:text-lg leading-relaxed line-clamp-3 overflow-hidden">
                      {p.description}
                    </div>
                  )}
                  {p.description && p.description.length > 150 && (
                    <button
                      onClick={() => openDescription(p.description)}
                      className="text-[#0AEFFF] hover:text-cyan-200 font-medium text-sm sm:text-base flex items-center gap-2 mt-2"
                    >
                      Read More <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  {/* Rest of card content */}
                </div>
                <div className="pt-4 sm:pt-6 border-t border-[#334155] mt-auto">
                  <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500 uppercase tracking-wider">One-time payment</p>
                      <p className="text-4xl sm:text-5xl font-bold text-[#0AEFFF]">
                        {p.price === "0.00" ? "FREE" : `$${p.price}`}
                      </p>
                    </div>
                    {p.price !== "0.00" && (
                      <div className="text-left sm:text-right">
                        <p className="text-xs sm:text-sm text-gray-500">Lifetime access</p>
                        <p className="text-green-400 font-bold text-sm sm:text-base">No recurring fees</p>
                      </div>
                    )}
                  </div>
                  {purchased.includes(p.id) ? (
                    <Button
                      onClick={() => onSelect(p.id)}
                      className="w-full bg-gradient-to-r from-[#0AEFFF] to-cyan-400 text-black font-bold text-lg sm:text-xl py-6 sm:py-8
                               hover:from-cyan-400 hover:to-cyan-300 shadow-xl transform hover:scale-105 transition-all"
                    >
                      Access Program
                      <ArrowRight className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>
                  ) : (
                    <Button
                      onClick={() => buy(p.id, p.price)}
                      className="w-full bg-gradient-to-r from-[#0AEFFF] to-cyan-400 text-black font-bold text-lg sm:text-xl py-6 sm:py-8
                               hover:from-cyan-400 hover:to-cyan-300 shadow-xl transform hover:scale-105 transition-all"
                    >
                      {Number(p.price) === 0 ? "Enroll Free Now" : "Buy Instant Access"}
                      <Zap className="ml-2 sm:ml-3 w-5 h-5 sm:w-6 sm:h-6" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* Footer */}
      <footer className="bg-[#0B1628] border-t border-[#334155] py-10 sm:py-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center space-y-6 sm:space-y-8">
          <div className="flex flex-wrap justify-center gap-6 sm:gap-12">
            <div className="flex items-center gap-3 sm:gap-4">
              <Users className="w-6 h-6 sm:w-8 sm:h-8 text-[#0AEFFF]" />
              <div className="text-left">
                <p className="text-xl sm:text-2xl font-bold text-white">13+</p>
                <p className="text-gray-400 text-sm sm:text-base">Active Learners</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
              <div className="text-left">
                <p className="text-xl sm:text-2xl font-bold text-white">95%</p>
                <p className="text-gray-400 text-sm sm:text-base">Success Rate</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:gap-4">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              <div className="text-left">
                <p className="text-xl sm:text-2xl font-bold text-white">100%</p>
                <p className="text-gray-400 text-sm sm:text-base">Secure Payments</p>
              </div>
            </div>
          </div>
          <p className="text-gray-500 text-sm sm:text-base">
            © 2025 SeventyHub Academy • All rights reserved • Premium Trading Education
          </p>
        </div>
      </footer>
      {/* Read More Modal */}
      {selectedDescription && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={closeDescription}
        >
          <div
            className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl sm:rounded-3xl p-6 sm:p-10 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-[#0AEFFF]/30 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeDescription}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 text-gray-400 hover:text-white transition"
            >
              <X className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
            <h3 className="text-2xl sm:text-3xl font-bold text-[#0AEFFF] mb-6 pr-10">
              Program Details
            </h3>
            <div className="prose prose-invert prose-lg max-w-none text-gray-200 leading-relaxed">
              {selectedDescription.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="mb-6 text-base sm:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
            <Button
              onClick={closeDescription}
              className="mt-8 w-full bg-[#0AEFFF] text-black font-bold text-lg sm:text-xl py-6 sm:py-8 hover:bg-cyan-300 transition-all"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}