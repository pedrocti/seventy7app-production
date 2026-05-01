import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  Briefcase,
  ArrowRight,
  Star,
} from "lucide-react";

const AcademyMentorshipPage = () => {
  const [activeTab, setActiveTab] = useState<"academy" | "internship">("academy");

  

  return (
    <main className="bg-[#0B1120] text-white min-h-screen overflow-hidden">
      {/* ================= HERO ================= */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120]/90 via-[#0B1120]/70 to-[#0B1120] z-10" />
        <img
          src="https://images.stockcake.com/public/3/b/4/3b4309ca-f1d9-46e3-8a1c-eacbaca1fc51_large/market-success-rising-stockcake.jpg"
          alt="Financial education"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 max-w-7xl mx-auto px-6 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl lg:text-7xl font-extrabold mb-6"
          >
            Seventy7 Academy
            <br />
            <span className="text-[#0AEFFF]">
              Education Before Profit
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-300 max-w-4xl mx-auto"
          >
            A structured financial literacy accelerator designed to develop independent traders and money managers
            with a supervised internship pathway for real-world application.
          </motion.p>
        </div>
      </section>

      {/* ================= TABS ================= */}
      <section className="max-w-7xl mx-auto px-6 -mt-12 relative z-20">
        <div className="flex justify-center gap-4 mb-12">
          <button
            onClick={() => setActiveTab("academy")}
            className={`px-8 py-4 rounded-full font-semibold transition-all ${
              activeTab === "academy"
                ? "bg-[#0AEFFF] text-[#0B1120]"
                : "bg-[#111B2E] text-gray-400 hover:text-white"
            }`}
          >
            Seventy7 Academy
          </button>

          <button
            onClick={() => setActiveTab("internship")}
            className={`px-8 py-4 rounded-full font-semibold transition-all ${
              activeTab === "internship"
                ? "bg-[#0AEFFF] text-[#0B1120]"
                : "bg-[#111B2E] text-gray-400 hover:text-white"
            }`}
          >
            Internship Programme
          </button>
        </div>

        {/* ================= TAB CONTENT ================= */}
        <AnimatePresence mode="wait">
          {activeTab === "academy" && (
            <motion.div
              key="academy"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="bg-[#111B2E]/80 backdrop-blur-xl rounded-3xl p-10 border border-[#0AEFFF]/20"
            >
              <div className="flex items-center gap-4 mb-6">
                <GraduationCap className="w-10 h-10 text-[#0AEFFF]" />
                <h2 className="text-3xl font-bold">Seventy7 Academy (12 Months)</h2>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                Seventy7 Academy is a structured one-year diploma programme designed to address a critical gap in modern
                education — practical financial literacy. Built on institutional frameworks and curated by professionals
                from industry and academia, the programme prioritizes education before profit and freedom through
                knowledge.
              </p>

              <ul className="space-y-4 text-gray-300 mb-8">
                <li><strong>Beginner Level (4 Months):</strong> Foundations of financial literacy, market mechanics, and risk discipline.</li>
                <li><strong>Intermediate Level (4 Months):</strong> Applied analysis, strategy development, and controlled market exposure.</li>
                <li><strong>Professional Level (4 Months):</strong> Advanced execution, portfolio thinking, and independent decision-making.</li>
              </ul>

              <p className="text-gray-400 text-sm mb-8">
                Graduates of the Academy may progress into a supervised Internship Programme to apply what they’ve
                learned under professional guidance.
              </p>

              <a
                href="/register"
                className="inline-flex items-center gap-3 bg-[#0AEFFF] text-[#0B1120] font-bold px-8 py-4 rounded-full"
              >
                Apply for Academy
                <ArrowRight />
              </a>

              <p className="text-xs text-gray-500 mt-4">Enrollment subject to approval.</p>
            </motion.div>
          )}

          {activeTab === "internship" && (
            <motion.div
              key="internship"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.5 }}
              className="bg-[#111B2E]/80 backdrop-blur-xl rounded-3xl p-10 border border-[#0AEFFF]/20"
            >
              <div className="flex items-center gap-4 mb-6">
                <Briefcase className="w-10 h-10 text-[#0AEFFF]" />
                <h2 className="text-3xl font-bold">Internship Programme</h2>
              </div>

              <p className="text-gray-300 mb-6 leading-relaxed">
                The Internship Programme is a selective, experience-driven pathway designed for traders who want to
                refine execution through structured training and supervised market exposure.
              </p>

              <ul className="space-y-4 text-gray-300 mb-8">
                <li>Capital audit assessment to evaluate risk behaviour</li>
                <li>Risk engineering frameworks for downside control</li>
                <li>System development aligned with individual trading styles</li>
                <li>Dedicated facilitator providing feedback and accountability</li>
              </ul>

              <p className="text-gray-400 text-sm mb-8">
                This programme is educational in nature and does not constitute employment, investment advice, or a
                guarantee of outcomes.
              </p>

              <a
                href="/register"
                className="inline-flex items-center gap-3 bg-[#0AEFFF] text-[#0B1120] font-bold px-8 py-4 rounded-full"
              >
                Apply for Internship
                <ArrowRight />
              </a>

              <p className="text-xs text-gray-500 mt-4">Admission subject to review and approval.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ================= PROGRAMME STANDARDS ================= */}
      <section className="py-24 bg-gradient-to-br from-[#0AEFFF]/5 via-transparent to-[#2563EB]/5">
        <div className="max-w-7xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold text-center mb-16"
          >
            Programme Standards & Expectations
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {/* Card 1 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-[#111B2E]/80 backdrop-blur-xl rounded-3xl p-8 border border-[#0AEFFF]/20"
            >
              <h3 className="text-xl font-bold mb-4 text-[#0AEFFF]">
                Financial Education First
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                We prioritize structured financial education covering trading, investing, and financial
                literacy. Our goal is to build understanding before capital deployment.
              </p>
            </motion.div>

            {/* Card 2 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-[#111B2E]/80 backdrop-blur-xl rounded-3xl p-8 border border-[#0AEFFF]/20"
            >
              <h3 className="text-xl font-bold mb-4 text-[#0AEFFF]">
                Quality Over Shortcuts
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                We do not promote signals, guarantees, or speculative shortcuts. Participants are
                expected to develop real financial knowledge and decision-making skills.
              </p>
            </motion.div>

            {/* Card 3 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-[#111B2E]/80 backdrop-blur-xl rounded-3xl p-8 border border-[#0AEFFF]/20"
            >
              <h3 className="text-xl font-bold mb-4 text-[#0AEFFF]">
                Real Market Understanding
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Our programmes focus on real financial market principles, investment thinking, and risk
                awareness rather than theoretical simulations.
              </p>
            </motion.div>

            {/* Card 4 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-[#111B2E]/80 backdrop-blur-xl rounded-3xl p-8 border border-[#0AEFFF]/20"
            >
              <h3 className="text-xl font-bold mb-4 text-[#0AEFFF]">
                Discipline & Accountability
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Successful wealth building requires discipline, patience, and responsible financial
                behaviour. Participants are expected to maintain these standards.
              </p>
            </motion.div>

            {/* Card 5 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-[#111B2E]/80 backdrop-blur-xl rounded-3xl p-8 border border-[#0AEFFF]/20"
            >
              <h3 className="text-xl font-bold mb-4 text-[#0AEFFF]">
                Strategic Capital Participation
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Through solutions like Stake-to-Earn and structured investment opportunities, individuals
                can participate in financial markets responsibly.
              </p>
            </motion.div>

            {/* Card 6 */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-[#111B2E]/80 backdrop-blur-xl rounded-3xl p-8 border border-[#0AEFFF]/20"
            >
              <h3 className="text-xl font-bold mb-4 text-[#0AEFFF]">
                Long-Term Wealth Building
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Our focus is not short-term speculation but developing the mindset and frameworks
                required for sustainable financial growth.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="mt-16 border-t border-[#0AEFFF]/20 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm text-[#848E9C]">

          {/* Brand */}
          <div>
            <h4 className="text-[#0AEFFF] font-semibold text-lg mb-2">Seventy7Hub</h4>
            <p className="text-xs leading-relaxed">
              Smarter Stakes, learning, and portfolio management all in one platform.
            </p>
          </div>

          {/* Navigation */}
          <div className="flex flex-col gap-2">
            <a href="/dashboard" className="hover:text-[#0AEFFF]">Dashboard</a>
            <a href="/invest" className="hover:text-[#0AEFFF]">Staking</a>
            <a href="/portfolio" className="hover:text-[#0AEFFF]">Portfolio Management</a>
          </div>

          {/* Social */}
          <div className="flex flex-col gap-2">
            <a href="https://t.me/seventy7hub" target="_blank" rel="noopener noreferrer">Telegram</a>
            <a href="https://discord.gg/seventy7hub" target="_blank" rel="noopener noreferrer">Discord</a>
            <a href="https://x.com/seventy7hub" target="_blank" rel="noopener noreferrer">X (Twitter)</a>
            <a href="https://www.instagram.com/seventy7trading?igsh=ZmNmNTBtdWJqa3Ax&utm_source=qr" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://www.facebook.com/share/1AiekpPNc3/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer">Facebook</a>
            <a href="https://www.linkedin.com/company/seventy7-trading-academy" target="_blank" rel="noopener noreferrer">LinkedIn</a>
          </div>

        </div>

        <div className="text-center text-xs text-[#6B7280] pb-6">
          © {new Date().getFullYear()} Seventy7Hub. All rights reserved.
        </div>
      </footer>
    </main>
  );
};

export default AcademyMentorshipPage;
