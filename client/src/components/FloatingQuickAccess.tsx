// client/src/components/FloatingQuickAccess.tsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MessageCircle } from "lucide-react";

const FloatingQuickAccess = () => {
  const [open, setOpen] = useState(false);

  const quickAccessButtons = [
    {
      icon: "fa-coins",
      label: "Invest & Earn",
      link: "/invest",
      color: "text-cyan-400",
    },
    {
      icon: "fa-chart-line",
      label: "Portfolio Management",
      link: "/portfolio",
      color: "text-cyan-400",
    },
    {
      icon: "fa-signal",
      label: "Community",
      link: "/signal",
      color: "text-cyan-400",
    },
    {
      icon: "fa-graduation-cap",
      label: "Mentorship",
      link: "/mentorship",
      color: "text-cyan-400",
    },
    // WhatsApp button integrated here
    {
      icon: <MessageCircle className="w-5 h-5" />,
      label: "speak with an advisor",
      href: "https://wa.me/2349030831907",
      isExternal: true,
      color: "text-green-400",
    },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="absolute bottom-20 right-0 flex flex-col items-end space-y-3 pb-4"
          >
            {quickAccessButtons.map((btn, index) => (
              <motion.div
                key={btn.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.06 * index },
                }}
                exit={{ opacity: 0, y: 30 }}
              >
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {btn.isExternal ? (
                        <a
                          href={btn.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 bg-[#0F172A]/90 backdrop-blur-lg text-white px-5 py-3 rounded-full shadow-xl border border-cyan-500/40 hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all duration-300 min-w-[180px]"
                        >
                          <span className={`flex items-center justify-center w-6 h-6 ${btn.color}`}>
                            {typeof btn.icon === "string" ? (
                              <i className={`fas ${btn.icon}`} />
                            ) : (
                              btn.icon
                            )}
                          </span>
                          <span className="text-sm font-medium">{btn.label}</span>
                        </a>
                      ) : (
                        <Link href={btn.link}>
                          <a className="flex items-center gap-3 bg-[#0F172A]/90 backdrop-blur-lg text-white px-5 py-3 rounded-full shadow-xl border border-cyan-500/40 hover:bg-cyan-500/20 hover:border-cyan-400/60 transition-all duration-300 min-w-[180px]">
                            <i className={`fas ${btn.icon} ${btn.color}`} />
                            <span className="text-sm font-medium">{btn.label}</span>
                          </a>
                        </Link>
                      )}
                    </TooltipTrigger>
                    <TooltipContent side="left" className="bg-[#0B1120] border-[#0AEFFF]/30">
                      {btn.label}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main toggle button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen(!open)}
        className="relative w-16 h-16 rounded-full flex items-center justify-center text-2xl text-white transition-all duration-500"
        aria-label="Toggle quick access menu"
      >
        {/* Glow effects */}
        <span
          className="absolute inset-0 rounded-full bg-cyan-500 opacity-40 blur-xl animate-pulse"
          style={{ animationDuration: "2.8s" }}
        />
        <span
          className="absolute inset-0 rounded-full border-2 border-cyan-400 animate-ping opacity-50"
          style={{ animationDuration: "2.2s" }}
        />

        {/* Button body */}
        <div className="relative z-10 bg-gradient-to-br from-cyan-500 to-blue-600 w-full h-full rounded-full shadow-2xl shadow-cyan-500/50 flex items-center justify-center border border-cyan-300/40 hover:shadow-cyan-600/60 transition-all duration-300">
          <i className={`fas ${open ? "fa-xmark" : "fa-bars"}`} />
        </div>
      </motion.button>
    </div>
  );
};

export default FloatingQuickAccess;