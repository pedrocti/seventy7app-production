 import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface BlogPostProps {
  title: string;
  date: string;
  excerpt: string;
  content: string[];
  animation: any;
}

const BlogPostCard = ({
  title,
  date,
  excerpt,
  content,
  animation,
  onReadMore
}: BlogPostProps & { onReadMore: () => void }) => {
  return (
    <motion.div
      variants={animation}
      className="backdrop-blur-md bg-opacity-20 bg-slate-900 rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 group"
      style={{
        boxShadow: '0 0 15px rgba(59, 130, 246, 0.2)',
        border: '1px solid rgba(59, 130, 246, 0.1)'
      }}
    >
      <div className="p-6 h-full flex flex-col">
        <h3 className="text-xl font-semibold mb-2 font-['Inter','Poppins',sans-serif]">{title}</h3>
        <p className="text-sm text-gray-400 mb-4 font-['Inter','Poppins',sans-serif]">{date}</p>
        <p className="text-base leading-relaxed text-gray-300 mb-6 flex-grow font-['Inter','Poppins',sans-serif]">
          {excerpt}
        </p>
        <button
          onClick={onReadMore}
          className="mt-4 inline-flex items-center text-blue-400 hover:text-blue-200 transition-colors duration-200 focus:outline-none font-['Inter','Poppins',sans-serif]"
        >
          Read More
          <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

const BlogModal = ({
  isOpen,
  onClose,
  title,
  date,
  content
}: {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  date: string;
  content: string[]
}) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm"></div>

          <motion.div
            className="relative bg-slate-900 bg-opacity-90 rounded-xl max-w-3xl mx-auto my-8 p-8 w-11/12 max-h-[90vh] overflow-y-auto"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              boxShadow: '0 0 30px rgba(59, 130, 246, 0.3)',
              border: '1px solid rgba(129, 140, 248, 0.2)'
            }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl focus:outline-none"
              aria-label="Close modal"
            >
              ×
            </button>

            <div className="mt-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white font-['Inter','Poppins',sans-serif]">{title}</h2>
              <p className="text-sm text-gray-400 mb-6 font-['Inter','Poppins',sans-serif]">{date}</p>

              <div className="space-y-4 text-gray-200 font-['Inter','Poppins',sans-serif]">
                {content.map((paragraph, index) => (
                  <p key={index} className="leading-relaxed">{paragraph}</p>
                ))}
              </div>

              {/* Updated CTA: Register & Login buttons */}
              <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-semibold rounded-full text-base transition-all duration-300 hover:shadow-glow focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
                >
                  Register Now
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
                <a
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 border-2 border-blue-400 text-blue-400 font-semibold rounded-full text-base transition-all duration-300 hover:bg-blue-400/10 focus:outline-none"
                >
                  Member Login
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const BlogSection = () => {
  const [activePostIndex, setActivePostIndex] = useState<number | null>(null);
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
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const itemLeftVariants = {
    hidden: { opacity: 0, x: -50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8 }
    }
  };

  const itemMiddleVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 }
    }
  };

  const itemRightVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.8 }
    }
  };

  const blogPosts: BlogPostProps[] = [
  {
  title: "How Beginners Can Start Investing in Financial Markets",
  date: "June 10, 2025",
  excerpt: "Entering the world of financial markets can feel overwhelming, but investing does not have to be complicated when you understand the right principles.",
  content: [
  "Entering the world of financial markets can feel overwhelming for beginners, but investing does not have to be complicated. The first step is understanding how markets work and learning the principles that guide successful investors.",

  "Financial markets include assets such as stocks, currencies, commodities, and cryptocurrencies. Each asset class offers different opportunities and risks, and understanding these differences is essential for building a balanced investment strategy.",

  "Beginners should focus on three key principles: education, risk management, and long-term thinking. Rather than chasing quick profits, successful investors take time to study market behavior and develop disciplined decision-making processes.",

  "With the right financial education and guidance, anyone can begin their journey in financial markets and gradually build the knowledge needed for long-term wealth creation."
  ],
  animation: itemLeftVariants
  },

  {
  title: "5 Financial Literacy Skills Everyone Should Learn Before 30",
  date: "June 5, 2025",
  excerpt: "Financial literacy is one of the most important life skills and learning it early can create long-term financial stability.",
  content: [
  "Financial literacy is one of the most important life skills, yet many people enter adulthood without understanding how money truly works. Learning key financial skills early can significantly improve long-term financial stability and wealth creation.",

  "The first essential skill is budgeting and money management. Knowing how to track income and expenses helps individuals control spending and build healthy financial habits.",

  "The second skill is saving and emergency planning, which provides financial security during unexpected situations.",

  "Third is understanding investing, which allows money to grow over time through financial markets.",

  "Fourth is debt management, ensuring individuals avoid harmful financial obligations.",

  "Finally, developing financial discipline and long-term thinking helps people make smarter financial decisions throughout life.",

  "Building these financial literacy skills early can create a strong foundation for financial independence and long-term wealth."
  ],
  animation: itemMiddleVariants
  },

  {
  title: "Understanding Market Cycles: A Beginner’s Guide to Smart Investing",
  date: "May 28, 2025",
  excerpt: "Financial markets move in cycles, and understanding these cycles helps investors manage risk and identify opportunities.",
  content: [
  "Financial markets move in cycles. Prices rise during periods of growth and fall during times of correction or economic uncertainty. Understanding these market cycles is an important part of smart investing.",

  "Market cycles typically move through four phases: accumulation, growth, distribution, and decline. During accumulation, experienced investors quietly enter the market while prices remain relatively low.",

  "Growth phases occur when strong demand pushes prices higher and attracts more investors.",

  "Distribution happens when markets reach peak enthusiasm, and early investors begin taking profits.",

  "Finally, during the decline phase, prices correct before eventually stabilizing and beginning the cycle again.",

  "Investors who understand market cycles are better prepared to manage risk, avoid emotional decision-making, and identify long-term opportunities in financial markets.",

  "Developing this understanding is a key step toward becoming a disciplined and informed investor."
  ],
  animation: itemRightVariants
  },

    {
      title: "Mastering Trading Psychology",
      date: "May 8, 2025",
      excerpt: "Learn about the psychological training and emotional discipline that sets apart successful traders from the rest of the market.",
      content: [
        "The difference between profitable traders and those who struggle often has little to do with strategy and everything to do with psychology. At Seventy7 Kapital, we consider psychological training to be the cornerstone of trading success.",
        "Our specialized mental conditioning program addresses the core emotional challenges every trader faces: fear of missing out, revenge trading, inability to cut losses, and the anxiety of uncertainty. Through structured exercises and real-time coaching, we help you develop the emotional discipline required to execute your strategy without interference from these destructive impulses.",
        "Using advanced biofeedback techniques and performance tracking analytics, our traders learn to recognize their own psychological patterns and develop personalized protocols for maintaining optimal trading states. This scientific approach to mental performance yields consistently better decision-making under pressure.",
        "The most powerful aspect of our psychological training is the community support system. Having access to mentors who have overcome the same challenges you face provides both practical guidance and the motivation to persevere through difficult market conditions. As one member put it: 'I finally understand that trading success is 80% psychology, 15% risk management, and only 5% strategy selection.'"
      ],
      animation: itemMiddleVariants
    },
  ];

  const handleOpenModal = (index: number) => {
    setActivePostIndex(index);
  };

  const handleCloseModal = () => {
    setActivePostIndex(null);
  };

  return (
    <section id="blog" className="py-20 relative overflow-hidden">
      {/* Removed bg-grid and both glowing orbs (the "dots") */}

      <div className="container mx-auto px-4 z-10 relative" ref={ref}>
        <motion.div
          className="text-center mb-16"
          variants={headerVariants}
          initial="hidden"
          animate={controls}
        >
          <h2 className="text-3xl md:text-5xl font-grotesk font-bold mb-6">
            Latest <span className="gradient-text">Insights</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Explore our latest articles to elevate your trading knowledge and financial independence.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          animate={controls}
        >
          {blogPosts.map((post, index) => (
            <BlogPostCard
              key={index}
              {...post}
              onReadMore={() => handleOpenModal(index)}
            />
          ))}
        </motion.div>
      </div>

      {/* Modal with updated Register/Login CTA */}
      {activePostIndex !== null && (
        <BlogModal
          isOpen={activePostIndex !== null}
          onClose={handleCloseModal}
          title={blogPosts[activePostIndex].title}
          date={blogPosts[activePostIndex].date}
          content={blogPosts[activePostIndex].content}
        />
      )}
    </section>
  );
};

export default BlogSection;