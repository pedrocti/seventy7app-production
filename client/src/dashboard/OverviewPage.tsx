import { motion, useMotionValue, animate } from "framer-motion";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, LabelList } from "recharts";
import { useAuth } from "@/auth/AuthContext";
import { useEffect, useState, useCallback, useRef } from "react";
import { format } from "date-fns";
import { BookOpen, Trophy, ArrowRight, Calendar } from "lucide-react";

// Hardened formatCurrency – never returns "NaN" or invalid string
const formatCurrency = (value: any): string => {
  if (value == null || value === "" || String(value).trim() === "" || String(value) === "NaN") {
    return "0.00";
  }
  const num = Number(value);
  return isNaN(num) ? "0.00" : num.toFixed(2);
};

function CarouselAutoSlider({
  items,
  showMarketing,
}: {
  items: any[];
  showMarketing: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const [isHovered, setIsHovered] = useState(false);
  const [contentWidth, setContentWidth] = useState(0);

  const doubledItems = [...items, ...items];

  useEffect(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.scrollWidth / 2;
    setContentWidth(w);

    let animation: any;
    const startAnimation = () => {
      animation = animate(x, [0, -w], {
        duration: 35,
        ease: "linear",
        repeat: Infinity,
      });
    };

    if (!isHovered && contentWidth > 0) {
      startAnimation();
    }

    return () => animation?.stop();
  }, [isHovered, contentWidth, x]);

  return (
    <motion.div
      className="relative overflow-hidden"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <motion.div className="flex gap-6" style={{ x }} ref={containerRef}>
        {doubledItems.map((item, idx) => (
          <motion.div
            key={`${item.id}-${idx}`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (item.type === "event" && item.link) {
                window.open(item.link, "_blank", "noopener,noreferrer");
              } else if (item.type === "program") {
                window.location.href = showMarketing
                  ? "/learning/programs"
                  : `/learning/program/${item.id}`;
              }
            }}
            className="
              flex-shrink-0 w-72 
              bg-gradient-to-br from-[#1E293B] to-[#0F172A] 
              rounded-xl p-6 
              border border-[#334155] 
              hover:border-[#0AEFFF] 
              hover:shadow-xl hover:shadow-[#0AEFFF]/20 
              cursor-pointer 
              transition-all duration-300
            "
          >
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-[#0AEFFF]/20 rounded-lg">
                {item.type === "event" ? (
                  <Calendar className="w-8 h-8 text-[#0AEFFF]" />
                ) : (
                  <Trophy className="w-8 h-8 text-[#0AEFFF]" />
                )}
              </div>
              <span className="text-xs text-gray-500 uppercase tracking-wider px-2 py-1 bg-[#0AEFFF]/10 rounded">
                {item.type === "event" ? "EVENT" : showMarketing ? "Premium" : "Enrolled"}
              </span>
            </div>

            <h4 className="text-xl font-bold text-white mb-3 line-clamp-2">
              {item.title}
            </h4>

            {item.type === "event" ? (
              <div className="space-y-3 mt-2">
                <p className="text-sm text-[#0AEFFF] font-medium">{item.date}</p>
                <p className="text-sm text-gray-300">with {item.mentor}</p>
                <p className="text-lg font-bold text-white mt-2">{item.price}</p>
              </div>
            ) : showMarketing ? (
              <div className="mt-6">
                <p className="text-3xl font-bold text-[#0AEFFF] mb-1">${item.price}</p>
                <p className="text-sm text-gray-400">Lifetime access • Expert-led</p>
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Progress</span>
                  <span className="font-medium text-[#0AEFFF]">{item.progress}%</span>
                </div>
                <div className="w-full bg-[#2B3139] rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.progress}%` }}
                    transition={{ duration: 1.4, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#0AEFFF] to-[#00D4FF] rounded-full"
                  />
                </div>
                <p className="text-xs text-gray-500">{item.courses} courses</p>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <span className="text-sm font-medium text-[#0AEFFF] flex items-center gap-2">
                {item.type === "event"
                  ? "Join Event"
                  : showMarketing
                  ? "Explore"
                  : "Continue"}
                <ArrowRight className="w-5 h-5" />
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
}

export default function OverviewPage() {
  const { user, token } = useAuth();
  const [overview, setOverview] = useState<any | null>(null);
  const [allPrograms, setAllPrograms] = useState<any[]>([]);
  const [tradesData, setTradesData] = useState<{ active: any | null; history: any[] }>({
    active: null,
    history: [],
  });
  const [mentorshipEvents, setMentorshipEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [pollMs] = useState(10000);

  useEffect(() => {
    if (!overview?.allocation || overview.allocation.length === 0) return;

    const interval = setInterval(() => {
      setOverview((prev: any) => {
        if (!prev) return prev;
        const newAlloc = prev.allocation.map((item: any) => ({
          ...item,
          value: item.value * (1 + (Math.random() * 0.1 - 0.05)),
          profit_percent: (Math.random() * 20 - 10).toFixed(1),
        }));
        return { ...prev, allocation: newAlloc };
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [overview?.allocation]);

  const fetchOverview = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/user/overview", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success) setOverview(data);
    } catch (err) {
      console.error("Overview fetch error:", err);
    }
  }, [token]);

  const fetchAllPrograms = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/learning/programs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        setAllPrograms(data.programs || []);
      }
    } catch (err) {
      console.error("Programs fetch error:", err);
    }
  }, [token]);

  const fetchTrades = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/trades", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data?.success) {
        setTradesData({
          active: Array.isArray(data.active) && data.active.length > 0 ? data.active[0] : null,
          history: Array.isArray(data.history) ? data.history : [],
        });
      }
    } catch (err) {
      console.error("Trades fetch error:", err);
    }
  }, [token]);

  const fetchMentorshipEvents = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/mentorship/events", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) {
        const normalized = (data.events || []).map((ev: any) => ({
          id: `event-${ev.id}`,
          title: ev.title,
          type: "event",
          date: `${new Date(ev.date).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })} • ${ev.time}`,
          mentor: ev.venue || "Mentorship Session",
          price: ev.price === "0.00" ? "FREE" : `$${ev.price}`,
          link: ev.link,
        }));
        setMentorshipEvents(normalized);
      }
    } catch (err) {
      console.error("Mentorship events fetch error:", err);
    }
  }, [token]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      await Promise.all([
        fetchOverview(),
        fetchAllPrograms(),
        fetchTrades(),
        fetchMentorshipEvents(),
      ]);
      setLoading(false);
    };

    run();

    const interval = setInterval(() => {
      fetchOverview();
      fetchAllPrograms();
      fetchTrades();
      fetchMentorshipEvents();
    }, pollMs);

    const handler = () => {
      fetchOverview();
      fetchAllPrograms();
      fetchTrades();
      fetchMentorshipEvents();
    };

    window.addEventListener("data-updated", handler);

    return () => {
      clearInterval(interval);
      window.removeEventListener("data-updated", handler);
    };
  }, [
    fetchOverview,
    fetchAllPrograms,
    fetchTrades,
    fetchMentorshipEvents,
    pollMs,
  ]);

  if (!overview) {
    return <p className="text-[#848E9C] text-center py-12">Loading insights...</p>;
  }

  const userData = overview.user || {};
  const totals = overview.totals || {};

  const recentTx = Array.isArray(overview.recent_transactions)
    ? overview.recent_transactions
    : [];
  const recentInv = Array.isArray(overview.recent_investments)
    ? overview.recent_investments
    : [];

  const balanceRaw = Number(userData.balance ?? 0) || 0;
  const bonusRaw = Number(userData.bonus_balance ?? 0) || 0;
  const portfolioRaw = Number(totals.portfolio_value ?? 0) || 0;

  const balance = formatCurrency(balanceRaw);
  const bonus = formatCurrency(bonusRaw);
  const portfolio = formatCurrency(portfolioRaw);

  // Enrolled programs
  const enrolledPrograms: any[] = [];
  if (Array.isArray(overview.enrolled_programs)) {
    overview.enrolled_programs.forEach((program: any) => {
      enrolledPrograms.push({
        id: program.id,
        title: program.title || "Untitled Program",
        type: "program",
        progress: Number(program.progress) || 0,
        courses: program.course_count || program.courses?.length || 0,
        price: formatCurrency(program.price || "0"),
      });
    });
  }

  const showMarketing = enrolledPrograms.length === 0 && allPrograms.length > 0;

  // Carousel items
  let carouselItems: any[] = showMarketing
    ? [
        ...allPrograms.map((p: any) => ({
          ...p,
          type: "program",
          price: formatCurrency(p.price || "0"),
        })),
        ...mentorshipEvents,
      ]
    : [...enrolledPrograms, ...mentorshipEvents];

  const { active: activeTrade, history } = tradesData;
  const recentHistory = history.slice(0, 3);

  return (
    <div className="relative min-h-screen bg-[#0A0E14]">
      {/* Glowing cyan border wrapper around main content */}
      <div
        className="
          relative z-20 mx-auto max-w-7xl 
          my-6 md:my-8 lg:my-10 
          rounded-3xl 
          border border-[#0AEFFF]/20 
          bg-black/10 backdrop-blur-xl 
          shadow-2xl shadow-[#0AEFFF]/10 
          overflow-hidden
        "
      >
        <div className="p-6 md:p-8 lg:p-10 space-y-8 text-[#EAECEF]">
          {/* TOP SECTION - 3-column grid */}
          <section className="grid lg:grid-cols-3 md:grid-cols-2 gap-6">
            {/* Portfolio Allocation Card */}
            <div className="rounded-2xl p-6 backdrop-blur-2xl bg-black/10 border border-[#0AEFFF]/30 shadow-lg shadow-[#0AEFFF]/10 flex flex-col">
              <h3 className="text-lg font-semibold text-[#0AEFFF] mb-6 tracking-wide">
                Portfolio Allocation
              </h3>
              {loading ? (
                <div className="flex-1 flex items-center justify-center min-h-[280px]">
                  <p className="text-[#848E9C] animate-pulse text-base">Loading allocation...</p>
                </div>
              ) : (!overview?.allocation || overview.allocation.length === 0) && Number(totals.portfolio_value ?? 0) > 0 ? (
                <div className="flex-1 min-h-[280px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[{ name: "Total Portfolio", value: Number(totals.portfolio_value ?? 0) }]}
                      margin={{ top: 40, right: 30, left: 20, bottom: 50 }}
                    >
                      <defs>
                        <linearGradient id="totalCyanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#0AEFFF" stopOpacity={1} />
                          <stop offset="100%" stopColor="#00D4FF" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" stroke="#848E9C" fontSize={13} tickLine={false} axisLine={false} />
                      <YAxis stroke="#848E9C" fontSize={13} tickLine={false} axisLine={false} />
                      <Bar
                        dataKey="value"
                        barSize={70}
                        radius={[16, 16, 0, 0]}
                        fill="url(#totalCyanGradient)"
                        animationDuration={2000}
                        animationEasing="ease-out"
                        animationBegin={500}
                      >
                        <LabelList
                          dataKey="value"
                          position="top"
                          formatter={(v: number) => `$${formatCurrency(v)}`}
                          fill="#0AEFFF"
                          fontSize={16}
                          fontWeight="bold"
                          offset={16}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0AEFFF] to-[#4AFFF5] drop-shadow-lg">
                        ${formatCurrency(totals.portfolio_value ?? 0)}
                      </div>
                      <div className="text-base text-[#0AEFFF] mt-2 font-medium tracking-wider">
                        Total Portfolio Value
                      </div>
                    </div>
                  </div>
                </div>
              ) : !overview?.allocation || overview.allocation.length === 0 ? (
                <div className="flex-1 flex items-center justify-center min-h-[280px]">
                  <p className="text-[#848E9C] text-lg">Portfolio is empty</p>
                </div>
              ) : (
                <div className="flex-1 min-h-[280px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overview.allocation} margin={{ top: 40, right: 40, left: 20, bottom: 60 }}>
                      <defs>
                        <linearGradient id="barCyanGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#0AEFFF" stopOpacity={1} />
                          <stop offset="100%" stopColor="#00D4FF" stopOpacity={0.8} />
                        </linearGradient>
                      </defs>
                      <XAxis
                        dataKey="name"
                        stroke="#848E9C"
                        fontSize={13}
                        tickLine={false}
                        axisLine={false}
                        interval={0}
                        angle={-30}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis stroke="#848E9C" fontSize={13} tickLine={false} axisLine={false} />
                      <Bar
                        dataKey="value"
                        barSize={55}
                        radius={[16, 16, 0, 0]}
                        fill="url(#barCyanGradient)"
                        animationDuration={2000}
                        animationEasing="ease-out"
                        animationBegin={300}
                      >
                        <LabelList
                          dataKey="value"
                          position="top"
                          formatter={(v: number) => {
                            const total = Number(totals.portfolio_value ?? 1);
                            const pct = ((v / total) * 100).toFixed(1);
                            return `$${formatCurrency(v)} (${pct}%)`;
                          }}
                          fill="#EAECEF"
                          fontSize={14}
                          fontWeight="600"
                          offset={16}
                        />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-90">
                    <div className="text-center">
                      <div className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0AEFFF] to-[#4AFFF5] drop-shadow-lg">
                        ${formatCurrency(totals.portfolio_value ?? 0)}
                      </div>
                      <div className="text-base text-[#0AEFFF] mt-2 font-medium tracking-wider">
                        Total Portfolio Value
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Programs + Events Carousel */}
            <div className="rounded-2xl p-6 backdrop-blur-2xl bg-black/10 border border-[#0AEFFF]/30 shadow-lg shadow-[#0AEFFF]/10 overflow-hidden">
              <h3 className="text-sm text-[#848E9C] mb-5">
                {showMarketing ? "Discover Programs & Events" : "My Learning & Sessions"}
              </h3>
              {carouselItems.length === 0 ? (
                <div className="text-center py-12">
                  <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No content available yet</p>
                </div>
              ) : (
                <CarouselAutoSlider items={carouselItems} showMarketing={showMarketing} />
              )}
            </div>

            {/* Live Trade + Recent History */}
            <div className="rounded-2xl p-5 backdrop-blur-2xl bg-black/10 border border-[#0AEFFF]/30 shadow-lg shadow-[#0AEFFF]/10">
              <h3 className="text-sm text-[#848E9C] mb-3">Live Trade & Recent History</h3>
              {activeTrade ? (
                <div className="relative bg-black/15 p-4 rounded-lg border border-[#0AEFFF]/25 overflow-hidden shadow-inner">
                  <div className="absolute inset-0 opacity-[0.08] pointer-events-none">
                    <div className="trade-wave"></div>
                  </div>
                  <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                    <span className="relative flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0ECB81] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-[#0ECB81]"></span>
                    </span>
                    <span className="text-xs font-bold text-[#0ECB81] uppercase tracking-wider px-2 py-1 bg-[#0ECB81]/20 rounded">
                      LIVE
                    </span>
                  </div>
                  <div className="flex items-start justify-between relative z-10 mb-4">
                    <div>
                      <div className="text-xl font-bold text-[#EAECEF]">
                        {activeTrade.pair || activeTrade.symbol || "—"}
                      </div>
                      <div className="text-xs text-[#848E9C] mt-1">
                        {activeTrade.created_at
                          ? format(new Date(activeTrade.created_at), "MMM d, yyyy • h:mm a")
                          : "—"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-lg font-black ${
                          (activeTrade.direction === "LONG" || activeTrade.side?.toLowerCase() === "buy")
                            ? "text-[#0ECB81] animate-pulse"
                            : "text-[#F6465D]"
                        }`}
                      >
                        {(activeTrade.direction || activeTrade.side || "—").toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm relative z-10">
                    <div>
                      <div className="text-[#848E9C] mb-1">Entry Price</div>
                      <div className="font-medium text-[#EAECEF]">
                        ${formatCurrency(activeTrade.entry_price ?? activeTrade.price ?? 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[#848E9C] mb-1">Opened</div>
                      <div className="font-medium text-[#EAECEF]">
                        {activeTrade.created_at
                          ? format(new Date(activeTrade.created_at), "MMM d, yyyy • h:mm a")
                          : "—"}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-[#848E9C] py-8 bg-black/10 rounded-lg border border-[#0AEFFF]/20">
                  No active trade right now
                </div>
              )}

              {/* Recent trades */}
              <div className="mt-6">
                <div className="text-xs text-[#848E9C] mb-3 uppercase tracking-wide">Recent Trades</div>
                {recentHistory.length === 0 ? (
                  <div className="text-center text-[#6B7280] py-6 bg-black/10 rounded-lg border border-[#0AEFFF]/20">
                    No recent trades yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentHistory.map((t: any) => {
                      const percent = Number(t.pnl_percent ?? 0);
                      const formattedPercent = percent.toFixed(2);
                      const isPositive = percent > 0;
                      const isNegative = percent < 0;
                      return (
                        <div
                          key={t.id}
                          className="flex items-center justify-between p-3 bg-black/10 rounded-lg border border-[#0AEFFF]/20 hover:border-[#0AEFFF]/40 transition-colors"
                        >
                          <div>
                            <div className="text-sm font-medium text-[#EAECEF]">
                              {t.pair || t.symbol || "—"}
                            </div>
                            <div className="text-xs text-[#848E9C] mt-1">
                              {(t.side || t.direction || "").toUpperCase()} • {t.strategy || "—"}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className={`text-lg font-bold ${
                                isPositive ? "text-[#0ECB81]" : isNegative ? "text-[#F6465D]" : "text-[#848E9C]"
                              }`}
                            >
                              {isPositive ? "+" : isNegative ? "-" : ""}
                              {formattedPercent}%
                              <span className="ml-2 text-xs font-normal opacity-80">
                                {isPositive ? "WIN" : isNegative ? "LOSS" : ""}
                              </span>
                            </div>
                            <div className="text-xs text-[#848E9C] mt-1">
                              {t.resolved_at ? format(new Date(t.resolved_at), "MMM d, yyyy") : "—"}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* REAL STATS – 3-column grid */}
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="backdrop-blur-2xl bg-black/10 p-6 rounded-2xl border border-[#0AEFFF]/30 shadow-lg shadow-[#0AEFFF]/10"
            >
              <h4 className="text-sm text-[#848E9C]">Total Balance</h4>
              <p className="text-3xl font-bold text-[#EAECEF] mt-2">${formatCurrency(portfolioRaw)}</p>
              <p className="text-xs text-[#848E9C] mt-1">Main: ${balance} • Bonus: ${bonus}</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="backdrop-blur-2xl bg-black/10 p-6 rounded-2xl border border-[#0AEFFF]/30 shadow-lg shadow-[#0AEFFF]/10"
            >
              <h4 className="text-sm text-[#848E9C]">Active Investments</h4>
              <p className="text-3xl font-bold text-[#EAECEF] mt-2">
                {totals.active_investments ?? 0}
              </p>
              <p className="text-xs text-[#848E9C] mt-1">
                Total invested: ${formatCurrency(totals.total_invested ?? 0)}
              </p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.03 }}
              className="backdrop-blur-2xl bg-black/10 p-6 rounded-2xl border border-[#0AEFFF]/30 shadow-lg shadow-[#0AEFFF]/10"
            >
              <h4 className="text-sm text-[#848E9C]">Portfolio Value</h4>
              <p className="text-3xl font-bold text-[#EAECEF] mt-2">${portfolio}</p>
              <p className="text-xs text-[#848E9C] mt-1">
                Total profit: ${formatCurrency(totals.total_profit ?? 0)}
              </p>
            </motion.div>
          </div>

          {/* RECENT ACTIVITY */}
          <div className="backdrop-blur-2xl bg-black/10 rounded-2xl p-6 border border-[#0AEFFF]/30 shadow-lg shadow-[#0AEFFF]/10">
            <h3 className="text-xl font-bold mb-6 text-[#0AEFFF]">Recent Activity</h3>
            {recentTx.length === 0 ? (
              <p className="text-center text-[#6B7280] py-8">No transactions yet</p>
            ) : (
              <div className="space-y-3">
                {recentTx.map((t: any) => (
                  <div
                    key={t.id}
                    className="flex justify-between items-center py-3 border-b border-[#0AEFFF]/10 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-[#EAECEF] capitalize">
                        {t.type === "referral_bonus" ? "Referral Bonus" : t.type}
                      </p>
                      <p className="text-xs text-[#848E9C]">
                        {t.created_at ? format(new Date(t.created_at), "MMM d, yyyy • h:mm a") : ""}
                      </p>
                      {t.status === "rejected" && t.details?.reject_reason && (
                        <p className="text-xs text-[#F6465D] mt-1">Reason: {t.details.reject_reason}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${t.amount > 0 ? "text-[#0ECB81]" : "text-[#F6465D]"}`}
                      >
                        {t.amount > 0 ? "+" : "-"}${formatCurrency(Math.abs(Number(t.amount ?? 0)))}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                          t.status === "completed"
                            ? "bg-[#0ECB81]/20 text-[#0ECB81]"
                            : t.status === "rejected"
                            ? "bg-[#F6465D]/20 text-[#F6465D]"
                            : "bg-[#0AEFFF]/20 text-[#0AEFFF]"
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RECENT INVESTMENTS */}
          <div className="backdrop-blur-2xl bg-black/10 rounded-2xl p-6 border border-[#0AEFFF]/30 shadow-lg shadow-[#0AEFFF]/10">
            <h3 className="text-xl font-bold mb-6 text-[#0AEFFF]">Recent Investments</h3>
            {recentInv.length === 0 ? (
              <p className="text-center text-[#6B7280] py-12">No investments yet</p>
            ) : (
              <div className="space-y-4">
                {recentInv.map((inv: any) => {
                  const now = Date.now();
                  const start = inv.startAt ? new Date(inv.startAt).getTime() : now;
                  const end = inv.endAt
                    ? new Date(inv.endAt).getTime()
                    : start + (inv.durationDays || 0) * 86400 * 1000;
                  const totalMs = Math.max(1, end - start);
                  const elapsedMs = Math.max(0, Math.min(now - start, totalMs));
                  const percent = Math.round((elapsedMs / totalMs) * 100);

                  return (
                    <motion.div
                      key={inv.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(10, 255, 255, 0.15)" }}
                      transition={{ duration: 0.3 }}
                      className="bg-black/15 rounded-xl p-4 border border-[#0AEFFF]/25 hover:border-[#0AEFFF]/40 transition-colors duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-base font-semibold text-[#EAECEF]">
                            {inv.planName || "Plan"}
                          </div>
                          <div className="text-sm text-[#848E9C] mt-1">
                            Amount: ${formatCurrency(inv.amount ?? 0)}
                          </div>
                          <div className="text-sm mt-1">
                            PnL:{" "}
                            <span
                              className={
                                Number(inv.profit_loss ?? 0) >= 0
                                  ? "text-[#0ECB81] font-medium"
                                  : "text-[#F6465D] font-medium"
                              }
                            >
                              ${formatCurrency(inv.profit_loss ?? 0)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-[#848E9C]">Ends</div>
                          <div className="text-sm font-semibold text-[#EAECEF]">
                            {inv.endAt ? new Date(inv.endAt).toLocaleDateString() : "—"}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="w-full bg-[#2B3139]/30 rounded-full h-3 overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-[#0AEFFF] to-[#00D4FF]"
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, percent)}%` }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                          />
                        </div>
                        <div className="mt-2 text-xs text-[#848E9C] flex items-center justify-between">
                          <span className="font-medium">{percent}% complete</span>
                          <span>
                            {inv.status === "active"
                              ? end
                                ? `${Math.max(
                                    0,
                                    Math.ceil((end - now) / (24 * 60 * 60 * 1000))
                                  )} days left`
                                : "Ongoing"
                              : "Completed"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto z-30 bg-black/25 backdrop-blur-xl border-t border-[#0AEFFF]/15 text-[#94A3B8] text-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <span className="font-medium">Trading Academy</span>
            <div className="flex gap-5">
              <a href="/about" className="hover:text-[#0AEFFF]/90 transition-colors">About</a>
              <a href="/contact" className="hover:text-[#0AEFFF]/90 transition-colors">Contact</a>
              <a href="/help" className="hover:text-[#0AEFFF]/90 transition-colors">Help</a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-right">
            <div className="flex gap-5">
              <a href="#" className="hover:text-[#0AEFFF]/90 transition-colors">Telegram</a>
              <a href="#" className="hover:text-[#0AEFFF]/90 transition-colors">Discord</a>
              <a href="#" className="hover:text-[#0AEFFF]/90 transition-colors">X</a>
            </div>
            <span className="text-xs opacity-80">
              © {new Date().getFullYear()} — All rights reserved
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}