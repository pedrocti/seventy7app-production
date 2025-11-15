import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Tooltip } from "@/components/ui/tooltip";

const FloatingQuickAccess = () => {
  const [open, setOpen] = useState(false);

  const buttons = [
    {
      icon: "fa-coins",
      label: "Invest & Earn",
      link: "/invest",
    },
    {
      icon: "fa-chart-line",
      label: "Portfolio Management",
      link: "/portfolio",
    },
    {
      icon: "fa-signal",
      label: "Signal Community",
      link: "/Signal", // ✅ fixed to singular
    },
    {
      icon: "fa-graduation-cap",
      label: "Mentorship",
      link: "/mentorship",
    },
  ];

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-16 right-0 flex flex-col items-end space-y-4 mb-4"
          >
            {buttons.map((btn, index) => (
              <motion.div
                key={btn.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.05 * index },
                }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Tooltip content={btn.label}>
                  <Link href={btn.link}>
                    <a className="flex items-center space-x-2 bg-[#0F172A]/80 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-lg border border-cyan-500/50 hover:bg-cyan-500/20 transition-all duration-300">
                      <i className={`fas ${btn.icon} text-cyan-400`}></i>
                      <span className="hidden sm:inline text-sm font-medium">
                        {btn.label}
                      </span>
                    </a>
                  </Link>
                </Tooltip>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glowing pulsing button */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(!open)}
        className="relative w-14 h-14 rounded-full flex items-center justify-center text-2xl text-white transition-all duration-500"
      >
        {/* Outer glow pulse */}
        <span
          className="absolute inset-0 rounded-full bg-cyan-500 opacity-40 blur-lg animate-pulse"
          style={{ animationDuration: "2.5s" }}
        ></span>

        {/* Inner ring pulse */}
        <span
          className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-40"
          style={{ animationDuration: "2s" }}
        ></span>

        {/* Main button */}
        <div className="relative z-10 bg-cyan-500 w-14 h-14 rounded-full shadow-lg shadow-cyan-400/40 flex items-center justify-center border border-cyan-300/30 hover:shadow-cyan-500/50 transition-all duration-300">
          <i className={`fas ${open ? "fa-xmark" : "fa-bars"}`}></i>
        </div>
      </motion.button>
    </div>
  );
};

export default FloatingQuickAccess;
