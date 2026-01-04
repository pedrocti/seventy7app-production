import { motion } from "framer-motion";
import { Users, Video, Clock, ArrowRight, Star, GraduationCap } from "lucide-react";

const AcademyMentorshipPage = () => {
  const features = [
    {
      title: "Seventy7 Academy Curriculum",
      icon: <GraduationCap className="w-8 h-8" />,
      description: "Comprehensive, structured education covering technical analysis, fundamental strategies, risk management, and trading psychology."
    },
    {
      title: "Live Market Sessions",
      icon: <Video className="w-8 h-8" />,
      description: "Real-time market breakdowns and trade execution walkthroughs led by experienced professional traders."
    },
    {
      title: "Expert Mentorship",
      icon: <Users className="w-8 h-8" />,
      description: "Personalized one-on-one guidance, strategy reviews, and feedback tailored to your individual progress and goals."
    },
    {
      title: "Learn at Your Own Pace",
      icon: <Clock className="w-8 h-8" />,
      description: "Flexible access to recorded materials, live sessions, and mentorship — designed to fit your schedule and learning style."
    },
  ];

  const successMetrics = [
    { label: "Traders Trained", value: "32+" },
    { label: "Average Skill Improvement", value: "94%" },
    { label: "Total Sessions Delivered", value: "70+" },
    { label: "Combined Mentors Experience", value: "20+ Years" },
  ];

  const testimonials = [
    {
      name: "Marcus T.",
      text: "The combination of academy structure and personal mentorship has transformed my trading. I finally understand the markets deeply.",
      rating: 5
    },
    {
      name: "Elena R.",
      text: "Best investment in my trading career. The curriculum is world-class, and the mentors genuinely care about your growth.",
      rating: 5
    },
    {
      name: "David P.",
      text: "From beginner to consistent trader — Seventy7 Academy and mentorship gave me the knowledge, discipline, and confidence I needed.",
      rating: 5
    },
  ];

  return (
    <main className="bg-[#0B1120] text-white min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B1120]/90 via-[#0B1120]/70 to-[#0B1120] z-10" />
        <img
          src="https://images.stockcake.com/public/3/b/4/3b4309ca-f1d9-46e3-8a1c-eacbaca1fc51_large/market-success-rising-stockcake.jpg"
          alt="Professional trader analyzing markets"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 text-center">
          <motion.h1
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-extrabold mb-6 leading-tight"
          >
            Seventy7 Academy<br />
            <span className="text-[#0AEFFF] bg-clip-text text-transparent bg-gradient-to-r from-[#0AEFFF] to-cyan-300">
              & Expert Mentorship
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
          >
            Freedom Through Knowledge. Education Before Profit.<br />
            Master financial markets with a proven academy curriculum and personalized mentorship from professional traders dedicated to your independent success.
          </motion.p>
          <motion.a
            href="/register" // Updated to registration page
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-[#0AEFFF] to-[#2563EB] text-[#0B1120] font-bold px-10 py-5 rounded-full shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all text-lg"
          >
            Register for Academy & Mentorship
            <ArrowRight className="w-6 h-6" />
          </motion.a>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-20 bg-[#0F172A]/50">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 grid grid-cols-2 lg:grid-cols-4 gap-8">
          {successMetrics.map((metric, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: idx * 0.15 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h3 className="text-4xl lg:text-5xl font-extrabold text-[#0AEFFF] mb-3">{metric.value}</h3>
              <p className="text-gray-400 text-sm lg:text-base">{metric.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl lg:text-5xl font-bold mb-4">
            Your Complete Path to <span className="text-[#0AEFFF]">Trading Mastery</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-3xl mx-auto">
            Combining world-class education with hands-on, personalized mentorship — designed for traders who want real skill and lasting independence.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: idx * 0.15 }}
              viewport={{ once: true }}
              whileHover={{ y: -10, scale: 1.03 }}
              className="bg-[#111B2E]/80 backdrop-blur-xl rounded-3xl p-8 text-center border border-[#0AEFFF]/20 hover:border-[#0AEFFF]/60 hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0AEFFF]/20 text-[#0AEFFF] mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-[#0AEFFF]/5 via-transparent to-[#2563EB]/5">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-4xl lg:text-5xl font-bold text-center mb-16"
          >
            Success Stories from Our Traders
          </motion.h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            {testimonials.map((t, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="bg-[#111B2E]/70 backdrop-blur-xl rounded-3xl p-8 border border-[#0AEFFF]/20 hover:border-[#0AEFFF]/50 transition-all"
              >
                <div className="flex mb-4">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-200 italic mb-6">"{t.text}"</p>
                <h4 className="text-[#0AEFFF] font-bold">- {t.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 text-center relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl lg:text-6xl font-extrabold mb-6"
          >
            Build Skill. Gain Confidence.<br />
            <span className="text-[#0AEFFF]">Become an Independent Trader.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-xl text-gray-300 mb-10 max-w-3xl mx-auto"
          >
            Join Seventy7 Academy & Mentorship today — where real education meets real results.
          </motion.p>
          <motion.a
            href="/register" // Updated to registration page
            whileHover={{ scale: 1.1, boxShadow: "0 0 40px rgba(10,239,255,0.5)" }}
            className="inline-flex items-center gap-4 bg-gradient-to-r from-[#0AEFFF] to-[#2563EB] text-[#0B1120] font-bold px-12 py-6 rounded-full text-xl shadow-2xl transition-all"
          >
            Register Now & Start Learning
            <ArrowRight className="w-8 h-8" />
          </motion.a>
        </div>
      </section>

      {/* Professional Footer */}
      <footer className="relative py-12 border-t border-[#0AEFFF]/20">
        <img
          src="https://thumbs.dreamstime.com/b/abstract-blue-glowing-wave-background-futuristic-digital-design-technology-elegant-flowing-cyan-waves-gracefully-curve-across-364426935.jpg"
          alt="Glowing waves background"
          className="absolute inset-0 w-full h-full object-cover opacity-20"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-center">
          <p className="text-2xl font-bold mb-2">Seventy7 Kapital</p>
          <p className="text-gray-400 mb-4">Seventy7 Academy • Expert Trading Mentorship</p>
          <p className="text-sm text-gray-500">© 2026 Seventy7 Kapital. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
};

export default AcademyMentorshipPage;