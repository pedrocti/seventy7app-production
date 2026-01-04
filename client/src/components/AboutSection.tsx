import { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const AboutSection = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  const leftVariants = {
    hidden: { opacity: 0, x: -60 },
    visible: { opacity: 1, x: 0, transition: { duration: 1 } }
  };

  return (
    <section id="about" className="py-24 lg:py-32 relative overflow-hidden bg-[#0B1120]">
      {/* Subtle ambient glows */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/3 -right-20 w-96 h-96 bg-[#7E22CE]/10 blur-3xl rounded-full" />
        <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-[#0AEFFF]/10 blur-3xl rounded-full" />
      </div>

      <div className="container mx-auto px-6 lg:px-12 relative z-10" ref={ref}>
        {/* About Headline & Introduction */}
        <motion.div
          className="max-w-5xl mx-auto text-center mb-16"
          initial="hidden"
          animate={controls}
          variants={containerVariants}
        >
          <motion.h2
            variants={itemVariants}
            className="text-4xl md:text-5xl lg:text-6xl font-bold mb-10 leading-tight"
          >
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0AEFFF] to-[#7E22CE]">Seventy7 Kapital</span>
          </motion.h2>

          <motion.div
            
            variants={itemVariants}
            className="space-y-6 text-lg md:text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto"
          >
            <p className="text-justify">
              Seventy7 Kapital is a premier trading education and mentorship platform dedicated to empowering individuals with the knowledge, discipline, and confidence required to achieve lasting success in financial markets.
            </p>
            <p className="text-justify">
              Founded on the core principle of <span className="font-semibold text-[#0AEFFF]">Freedom Through Knowledge : Education Before Profit</span>, we deliver a comprehensive academy curriculum combined with personalized expert mentorship. This integrated approach enables traders at all experience levels to develop institutional-grade skills and evolve into consistently profitable, fully independent market operators.
            </p>
          </motion.div>
        </motion.div>

        {/* Mission Statement – Added after About */}
        <motion.div
          className="max-w-4xl mx-auto text-center mb-24"
          initial="hidden"
          animate={controls}
          variants={containerVariants}
        >
          <motion.h3
            variants={itemVariants}
            className="text-3xl md:text-4xl font-bold mb-8 text-white"
          >
            Our Mission
          </motion.h3>

          <motion.div
            variants={itemVariants}
            className="space-y-5 text-lg md:text-xl text-gray-300 leading-relaxed"
          >
            <p className="text-justify font-medium italic">
              Seventy7 Kapital exists to transform aspiring traders into confident, independent market operators who achieve consistent profitability and lasting financial freedom.
            </p>
            <p className="text-justify">
              We stand firmly on the principle of <span className="font-semibold text-[#0AEFFF]">Freedom Through Knowledge : Education Before Profit.</span>, That's why we deliver a comprehensive academy curriculum alongside personalized expert mentorship, enabling traders at every level to master technical analysis, risk management, trading psychology, and market structure.
            </p>
            <p className="text-justify"> We don't sell signals. We build traders. </p>
            <p className="text-justify"> Our integrated approach cultivates deep understanding, ironclad discipline, and strategic independence turning knowledge into sustainable wealth. Through our vibrant community, curated investment paths, professional portfolio management, and stake trading opportunities, every member gains the tools and support needed to thrive on their own terms. </p>
            <p className="text-justify">
              Join 77kapital and step into a future where you own your financial journey with clarity, confidence, and control.
            </p>
          </motion.div>
        </motion.div>

        {/* Image + Core Pillars */}
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-7xl mx-auto">
          {/* Left: Professional Image */}
          <motion.div
            variants={leftVariants}
            initial="hidden"
            animate={controls}
            className="order-2 lg:order-1"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-[#0AEFFF]/10 to-[#7E22CE]/10" />
              <img
                src="https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
                alt="Professional trader analyzing advanced market data on multiple screens"
                className="w-full h-auto object-cover"
              />
            </div>
          </motion.div>

          {/* Right: Core Pillars */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={controls}
            className="space-y-10 order-1 lg:order-2"
          >
            <motion.div
              variants={itemVariants}
              className="bg-[#111B2E]/70 backdrop-blur-xl rounded-3xl p-8 border border-[#0AEFFF]/20 hover:border-[#0AEFFF]/40 transition-all duration-500"
            >
              <div className="flex items-start gap-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0AEFFF] to-[#2563EB] shadow-lg">
                  <i className="fas fa-chart-line text-3xl text-[#0B1120]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Institutional-Grade Education</h3>
                  <p className="text-gray-300 leading-relaxed text-justify">
                    Master technical analysis, risk management, trading psychology, and market structure through our rigorous, structured academy curriculum designed for real-world application.
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="bg-[#111B2E]/70 backdrop-blur-xl rounded-3xl p-8 border border-[#0AEFFF]/20 hover:border-[#0AEFFF]/40 transition-all duration-500"
            >
              <div className="flex items-start gap-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0AEFFF] to-[#2563EB] shadow-lg">
                  <i className="fas fa-user-tie text-3xl text-[#0B1120]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-4 text-white">Personalized Expert Mentorship</h3>
                  <p className="text-gray-300 leading-relaxed text-justify">
                    Receive tailored one-on-one guidance from seasoned professional traders committed to your individual progress and long-term consistency in the markets.
                  </p>
                </div>
              </div>
            </motion.div>

           
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;