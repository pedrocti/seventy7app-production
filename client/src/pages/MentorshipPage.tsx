import { motion } from "framer-motion";
import { Users, BookOpen, Video, Clock } from "lucide-react";

const MentorshipPage = () => {
  const mentorshipSteps = [
    {
      title: "Structured Curriculum",
      icon: <BookOpen className="text-[#0AEFFF] w-6 h-6" />,
      description: "Step-by-step lessons covering technical and fundamental trading strategies."
    },
    {
      title: "Live Market Analysis",
      icon: <Video className="text-[#0AEFFF] w-6 h-6" />,
      description: "Real-time breakdowns of market trends and trades by professional mentors."
    },
    {
      title: "Personalized Feedback",
      icon: <Users className="text-[#0AEFFF] w-6 h-6" />,
      description: "One-on-one guidance to help refine your strategy and decision-making."
    },
    {
      title: "Flexible Schedule",
      icon: <Clock className="text-[#0AEFFF] w-6 h-6" />,
      description: "Learn at your own pace with sessions tailored to your availability."
    },
  ];

  const successMetrics = [
    { label: "Traders Mentored", value: "1,200+" },
    { label: "Avg Portfolio Growth", value: "35%" },
    { label: "Live Sessions Held", value: "450+" },
    { label: "Years of Experience", value: "15+" },
  ];

  return (
    <main className="bg-[#0B1120] text-white font-sans overflow-hidden">
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-16 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-4"
        >
          Transform Your Trading with <span className="text-[#0AEFFF]">Expert Mentorship</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base mb-8"
        >
          Learn directly from professional traders who have mastered the markets. Gain structured lessons, live market insights, and personalized guidance to become a consistent trader.
        </motion.p>
        <motion.a
          href="https://t.me/Seventy7kapitaladmin1"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          className="inline-block bg-gradient-to-r from-[#0AEFFF] to-[#2563EB] text-[#0B1120] font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-cyan-500/30 transition-all"
        >
          Get Mentorship Access
        </motion.a>
      </section>

      {/* Success Metrics */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
        {successMetrics.map((metric, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            className="bg-[#111B2E]/70 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-[#0AEFFF22]"
          >
            <h3 className="text-2xl font-bold text-[#0AEFFF] mb-2">{metric.value}</h3>
            <p className="text-gray-400 text-sm">{metric.label}</p>
          </motion.div>
        ))}
      </section>

      {/* How Mentorship Works */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-2">
            How Our <span className="text-[#0AEFFF]">Mentorship</span> Works
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-sm sm:text-base">
            A structured, interactive, and personalized approach to transform your trading skills.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {mentorshipSteps.map((step, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.03 }}
              className="bg-[#111B2E]/70 backdrop-blur-xl rounded-3xl p-6 shadow-lg border border-[#0AEFFF22] text-center"
            >
              <div className="mb-4 flex justify-center">{step.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
              <p className="text-gray-400 text-sm">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 py-16 bg-gradient-to-r from-[#0AEFFF]/10 to-[#2563EB]/10 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-10">What Our Traders Say</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { name: "Alice M.", text: "The mentorship program helped me trade confidently. The live market sessions are invaluable." },
            { name: "James K.", text: "Professional, detailed, and supportive. My trading skills have improved tremendously." },
            { name: "Sophie L.", text: "I now understand market strategies and risk management thanks to Seventy7 Kapital." },
          ].map((item, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.02 }} className="bg-[#111B2E]/80 backdrop-blur-md rounded-3xl p-6 shadow-lg">
              <p className="text-gray-200 mb-2">"{item.text}"</p>
              <h4 className="text-[#0AEFFF] font-semibold">{item.name}</h4>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="max-w-5xl mx-auto px-6 sm:px-12 py-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
          Ready to <span className="text-[#0AEFFF]">Level Up Your Trading?</span>
        </h2>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto text-sm sm:text-base">
          Join our mentorship program and start receiving expert guidance today. Your trading journey deserves the best support.
        </p>
        <motion.a
          href="https://t.me/Seventy7kapitaladmin1"
          whileHover={{ scale: 1.05 }}
          className="inline-block bg-gradient-to-r from-[#0AEFFF] to-[#2563EB] text-[#0B1120] font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-cyan-500/30 transition-all"
        >
          Get Mentorship Access
        </motion.a>
      </section>
    </main>
  );
};

export default MentorshipPage;
