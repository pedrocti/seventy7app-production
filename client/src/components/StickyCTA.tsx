// client/src/components/StickyCTA.tsx
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';

const StickyCTA = () => {
  return (
    <motion.a
      href="https://wa.me/2349030831907"
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.4, delay: 1, ease: "easeOut" }}
      className="fixed bottom-28 right-6 z-[10000] group"  // ← Changed from bottom-6 to bottom-28 (above the other button)
      aria-label="Chat with a trading expert on WhatsApp"
    >
      {/* Glow Pulse */}
      <div className="absolute inset-0 bg-[#0AEFFF]/30 rounded-full blur-xl scale-0 group-hover:scale-150 transition-transform duration-500" />

      {/* Main Button */}
      <div className="relative bg-gradient-to-r from-[#0AEFFF] to-[#2563EB] p-5 rounded-full shadow-2xl hover:shadow-cyan-500/60 transition-all duration-300 hover:scale-110">
        <MessageCircle className="w-8 h-8 text-[#0B1120]" />
      </div>

      {/* Desktop Tooltip (appears on hover) */}
      <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 hidden md:block pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="bg-[#0B1120]/95 backdrop-blur-md text-white font-medium px-5 py-3 rounded-2xl whitespace-nowrap border border-[#0AEFFF]/30 shadow-xl">
          Speak with a financial adviser
          <div className="absolute left-full top-1/2 -translate-y-1/2 w-0 h-0 border-l-8 border-l-[#0B1120]/95 border-y-8 border-y-transparent" />
        </div>
      </div>

      {/* Mobile Tooltip (always visible above button) */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 md:hidden pointer-events-none">
        <div className="bg-[#0B1120]/90 backdrop-blur-md text-white font-medium text-sm px-4 py-2 rounded-full whitespace-nowrap border border-[#0AEFFF]/30 shadow-xl">
          Speak with a finance expert
        </div>
      </div>
    </motion.a>
  );
};

export default StickyCTA;