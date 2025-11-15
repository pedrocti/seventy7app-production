import { useEffect } from "react";
import { motion, useAnimation } from "framer-motion";
import { useInView } from "react-intersection-observer";

interface PlanCardProps {
  icon: string;
  gradientFrom: string;
  gradientTo: string;
  title: string;
  price: string;
  description: string;
  features: string[];
  ctaText: string;
  delay?: number;
  telegramLinks?: string[];
}

const PlanCard = ({
  icon,
  gradientFrom,
  gradientTo,
  title,
  price,
  description,
  features,
  ctaText,
  delay = 0,
  telegramLinks,
}: PlanCardProps) => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    if (inView) {
      controls.start({
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, delay },
      });
    }
  }, [controls, inView, delay]);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    if (telegramLinks && telegramLinks.length > 0) {
      e.preventDefault();
      const randomIndex = Math.floor(Math.random() * telegramLinks.length);
      window.open(telegramLinks[randomIndex], "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={controls}
      className="neon-border rounded-3xl overflow-hidden transition-all duration-500 hover:scale-105 group bg-[#111936]"
    >
      <div className="p-8 h-full flex flex-col">
        <div
          className={`bg-gradient-to-r from-[${gradientFrom}] to-[${gradientTo}] w-16 h-16 rounded-2xl flex items-center justify-center mb-5`}
        >
          <i className={`fas ${icon} text-white text-3xl`}></i>
        </div>

        <h3 className="text-2xl font-grotesk font-bold mb-1">{title}</h3>
        <p className="text-[#0AEFFF] font-semibold text-xl mb-3">{price}</p>
        <p className="text-gray-300 mb-4">{description}</p>

        <ul className="text-gray-300 space-y-2 mb-6">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              <i className="fas fa-check text-[#0AEFFF] mr-3"></i>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <a
          href={telegramLinks ? telegramLinks[0] : "https://t.me/Access77bot"}
          onClick={telegramLinks ? handleClick : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#0AEFFF] font-medium inline-flex items-center group-hover:underline"
        >
          {ctaText}
          <i className="fas fa-arrow-right ml-2 transition-transform duration-300 group-hover:translate-x-2"></i>
        </a>
      </div>
    </motion.div>
  );
};

const ServicesSection = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });

  useEffect(() => {
    if (inView) controls.start("visible");
  }, [controls, inView]);

  const headerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const plans = [
    {
      icon: "fa-book",
      gradientFrom: "#7E22CE",
      gradientTo: "#3B82F6",
      title: "Free Plan",
      price: "Free",
      description:
        "Access essential learning materials and get started on your trading journey.",
      features: [
        "Foundational trading lessons",
        "Market analysis basics",
        "Risk management principles",
        "2 - 3 monthly free signals",
      ],
      ctaText: "Start Free",
      delay: 0.2,
    },
    {
      icon: "fa-crown",
      gradientFrom: "#3B82F6",
      gradientTo: "#0AEFFF",
      title: "Monthly Plan",
      price: "$39.99 / month",
      description:
        "Unlock premium services, mentorship, and real-time signal access to accelerate your growth.",
      features: [
        "1-on-1 mentorship on request",
        "Access to real-time signals",
        "Exclusive trading community",
        "Strategy development guidance",
      ],
      ctaText: "Subscribe Monthly",
      delay: 0.4,
      telegramLinks: ["https://t.me/Seventy7kapitaladmin1"],
    },
    {
      icon: "fa-building-columns",
      gradientFrom: "#0AEFFF",
      gradientTo: "#9D4EDD",
      title: "Annual Plan",
      price: "$299.99 / year",
      description:
        "All premium features plus Prop Firm Assist to help you pass and manage funded accounts.",
      features: [
        "All Premium Plan benefits",
        "Challenge preparation support",
        "Strategy optimization",
        "Account evaluation assistance",
        "Direct funding guidance",
      ],
      ctaText: "Join Annual Plan",
      delay: 0.6,
      telegramLinks: [
        "https://t.me/Seventy7_Kapital",
        "https://t.me/Seventy7kapitaladmin1",
      ],
    },
  ];

  return (
    <section id="plans" className="py-20 bg-[#0F172A] relative overflow-hidden">
      <div className="absolute inset-0 bg-grid z-0"></div>

      <div className="container mx-auto px-4 z-10 relative" ref={ref}>
        <motion.div
          className="text-center mb-16"
          variants={headerVariants}
          initial="hidden"
          animate={controls}
        >
          <h2 className="text-3xl md:text-5xl font-grotesk font-bold mb-6">
            Choose Your <span className="gradient-text">Plan</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Flexible options designed for every stage of your trading journey.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <PlanCard key={index} {...plan} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
