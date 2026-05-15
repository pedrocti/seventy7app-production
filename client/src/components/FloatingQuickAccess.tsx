import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { MessageCircle, Coins, TrendingUp, Radio, GraduationCap, X, Menu } from "lucide-react";

const BTNS = [
  { icon: "coins",         label: "Stake to Earn",         link: "/invest"      },
  { icon: "trending-up",   label: "Portfolio Management",  link: "/portfolio"   },
  { icon: "radio",         label: "Community",             link: "/signal"      },
  { icon: "graduation-cap",label: "Academy",               link: "/mentorship"  },
  { icon: "message",       label: "Speak with an Advisor", link: "https://wa.me/+447887649072", external: true },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  "coins":          <Coins size={14} />,
  "trending-up":    <TrendingUp size={14} />,
  "radio":          <Radio size={14} />,
  "graduation-cap": <GraduationCap size={14} />,
  "message":        <MessageCircle size={14} />,
};

const base: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 10,
  padding: "9px 16px", fontFamily: "var(--font-mono)",
  fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase",
  textDecoration: "none", whiteSpace: "nowrap", transition: "all 0.2s ease",
};

export default function FloatingQuickAccess() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "absolute", bottom: 64, right: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}
          >
            {BTNS.map((btn, i) => (
              <motion.div key={btn.label}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.05 * i } }}
                exit={{ opacity: 0, x: 16 }}
              >
                {btn.external ? (
                  <a href={btn.link} target="_blank" rel="noopener noreferrer"
                    style={{ ...base, background: "rgba(14,203,129,0.06)", border: "1px solid rgba(14,203,129,0.25)", color: "var(--green)" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "rgba(14,203,129,0.12)")}
                    onMouseLeave={e => (e.currentTarget.style.background = "rgba(14,203,129,0.06)")}
                  >
                    <span style={{ color: "var(--green)" }}>{ICON_MAP[btn.icon]}</span>
                    {btn.label}
                  </a>
                ) : (
                  <Link href={btn.link}>
                    <a style={{ ...base, background: "var(--surface)", border: "1px solid rgba(10,239,255,0.15)", color: "var(--muted)" }}
                      onMouseEnter={e => { e.currentTarget.style.color = "var(--cyan)"; e.currentTarget.style.background = "var(--cyan-dim)"; e.currentTarget.style.borderColor = "rgba(10,239,255,0.35)"; }}
                      onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.background = "var(--surface)"; e.currentTarget.style.borderColor = "rgba(10,239,255,0.15)"; }}
                    >
                      <span style={{ color: "var(--cyan)" }}>{ICON_MAP[btn.icon]}</span>
                      {btn.label}
                    </a>
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}
        onClick={() => setOpen(!open)}
        aria-label="Toggle quick access"
        style={{ position: "relative", width: 48, height: 48, borderRadius: 0, border: "1px solid rgba(10,239,255,0.35)", background: open ? "rgba(10,239,255,0.1)" : "linear-gradient(135deg, var(--cyan), var(--purple))", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "white" }}
      >
        {!open && (
          <motion.span style={{ position: "absolute", inset: -4, border: "1px solid rgba(10,239,255,0.3)", pointerEvents: "none" }}
            animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.15, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        )}
        <AnimatePresence mode="wait">
          <motion.span key={String(open)}
            initial={{ opacity: 0, rotate: -90 }} animate={{ opacity: 1, rotate: 0 }} exit={{ opacity: 0, rotate: 90 }}
            transition={{ duration: 0.18 }}
          >
            {open ? <X size={16} /> : <Menu size={16} />}
          </motion.span>
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
