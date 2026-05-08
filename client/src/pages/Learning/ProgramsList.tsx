import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { apiRequest } from "@/api/http";
import { BookOpen, Clock, Star, ArrowRight, CheckCircle2 } from "lucide-react";

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
  onSelect?: (id: number) => void;
}) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [purchased, setPurchased] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      const res = await apiRequest("/learning/programs");
      if (res.success) {
        setPrograms((res as any).programs || []);
        setPurchased((res as any).purchased || []);
      } else {
        toast.error(res.error || "Failed to load programs");
      }
      setLoading(false);
    };
    load();
  }, []);

  const accessOrBuy = async (program: Program) => {
    const price = Number(program.price);
    const isPurchased = purchased.includes(program.id);

    // Already purchased or free — navigate directly
    if (isPurchased || price === 0) {
      onSelect?.(program.id);
      return;
    }

    // Paid + not yet purchased — buy first
    setBuyingId(program.id);
    try {
      const res = await apiRequest(`/learning/programs/buy/${program.id}`, { method: "POST" });
      if (res.success) {
        toast.success("Payment successful! Access granted.");
        setPurchased((prev) => [...prev, program.id]);
        onSelect?.(program.id);
      } else {
        toast.error(res.error || "Payment failed");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setBuyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center animate-pulse">
          <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: "var(--cyan)" }} />
          <p className="text-2xl" style={{ color: "var(--text-2)" }}>Loading programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>

      {/* Hero */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-5xl mx-auto">
          <h1
            className="text-5xl font-bold mb-6"
            style={{
              background: "linear-gradient(to right, var(--cyan), #67e8f9)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Unlock Your Potential
          </h1>
          <p className="text-xl max-w-3xl mx-auto" style={{ color: "var(--text-2)" }}>
            Join successful learners, traders and investors through our premium certified programs.
          </p>
        </div>
      </section>

      {/* Programs Grid */}
      <section className="max-w-7xl mx-auto px-4 pb-20">
        <h2 className="text-4xl font-bold text-center mb-16" style={{ color: "var(--cyan)" }}>
          Premium Mentorship Programs
        </h2>

        {programs.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-24 h-24 mx-auto mb-6" style={{ color: "var(--muted)" }} />
            <p className="text-2xl" style={{ color: "var(--muted)" }}>No programs available yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {programs.map((p) => {
              const isFree = Number(p.price) === 0;
              const isOwned = purchased.includes(p.id);
              const isBuying = buyingId === p.id;

              return (
                <div
                  key={p.id}
                  className="rounded-3xl p-10 border flex flex-col transition-all duration-300 hover:scale-[1.01]"
                  style={{
                    background: "linear-gradient(135deg, var(--surface-4), var(--surface))",
                    borderColor: isOwned ? "var(--cyan)" : "var(--surface-3)",
                    boxShadow: isOwned ? "0 0 24px rgba(10, 239, 255, 0.12)" : undefined,
                  }}
                >
                  <div className="flex-grow space-y-6">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        {isOwned ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" style={{ color: "var(--green)" }} />
                            <span className="text-sm font-medium uppercase" style={{ color: "var(--green)" }}>
                              Enrolled
                            </span>
                          </>
                        ) : (
                          <>
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="text-sm uppercase" style={{ color: "var(--cyan)" }}>Premium</span>
                          </>
                        )}
                      </div>
                      <h3 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
                        {p.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3" style={{ color: "var(--muted)" }}>
                      <Clock className="w-5 h-5" />
                      <span>{p.duration_days} days full access</span>
                    </div>

                    {p.description && (
                      <p className="line-clamp-3" style={{ color: "var(--text-2)" }}>
                        {p.description}
                      </p>
                    )}

                    {p.description && (
                      <button
                        onClick={() => onSelect?.(p.id)}
                        className="flex items-center gap-2 font-medium transition-colors hover:opacity-80"
                        style={{ color: "var(--cyan)" }}
                      >
                        View Full Details
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div
                    className="pt-6 mt-8 border-t"
                    style={{ borderColor: "var(--surface-3)" }}
                  >
                    <p className="text-4xl font-bold mb-6" style={{ color: "var(--cyan)" }}>
                      {isFree ? "FREE" : `$${p.price}`}
                    </p>

                    <Button
                      onClick={() => accessOrBuy(p)}
                      disabled={isBuying}
                      className="w-full font-bold text-lg py-6 hover:scale-105 transition border-0"
                      style={{
                        background: "linear-gradient(to right, var(--cyan), #67e8f9)",
                        color: "#000",
                      }}
                    >
                      {isBuying
                        ? "Processing..."
                        : isFree || isOwned
                        ? "Access Program"
                        : "Buy & Access"}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
