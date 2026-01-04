import { motion } from 'framer-motion';
import logoImage from '../assets/logo.jpeg';
import { Link } from 'wouter';

const Footer = () => {
  const footerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.footer
      className="pt-16 pb-8 relative overflow-hidden bg-[#020617]"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={footerVariants}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Logo & Description */}
          <motion.div variants={itemVariants}>
            <div className="flex items-center mb-6">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-[#0AEFFF] to-[#7E22CE] rounded-full opacity-70 blur-sm group-hover:opacity-100 transition duration-300" />
                <img
                  src={logoImage}
                  alt="Seventy7 Kapital Logo"
                  className="relative h-10 w-auto object-contain rounded-full"
                />
              </div>
            </div>
            <p className="text-gray-400 mb-6">
              Empowering traders with institutional-grade education and personalized mentorship for lasting financial independence.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://twitter.com/Seventy7Kapital"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#0AEFFF] transition-colors duration-300"
              >
                <i className="fab fa-twitter text-xl" />
              </a>
              <a
                href="https://instagram.com/seventy7kapital"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#0AEFFF] transition-colors duration-300"
              >
                <i className="fab fa-instagram text-xl" />
              </a>
              <a
                href="https://t.me/Access77bot"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#0AEFFF] transition-colors duration-300"
              >
                <i className="fab fa-telegram text-xl" />
              </a>
              <a
                href="https://discord.gg/seventy7kapital"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-[#0AEFFF] transition-colors duration-300"
              >
                <i className="fab fa-discord text-xl" />
              </a>
            </div>
          </motion.div>

          {/* Our Offerings */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-grotesk font-bold text-lg mb-6">Our Offerings</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link to="/mentorship" className="hover:text-[#0AEFFF] transition-colors duration-300">
                  Seventy7 Academy
                </Link>
              </li>
              <li>
                <Link to="/mentorship" className="hover:text-[#0AEFFF] transition-colors duration-300">
                  Expert Mentorship
                </Link>
              </li>
              <li>
                <Link to="/invest" className="hover:text-[#0AEFFF] transition-colors duration-300">
                  Invest & Earn
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-[#0AEFFF] transition-colors duration-300">
                  Trading Community
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-grotesk font-bold text-lg mb-6">Company</h3>
            <ul className="space-y-3 text-gray-400">
              <li>
                <Link to="/#about" className="hover:text-[#0AEFFF] transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/#blog" className="hover:text-[#0AEFFF] transition-colors duration-300">
                  Blog & Insights
                </Link>
              </li>
              {/* Removed "Contact" since you don't have a dedicated contact page */}
            </ul>
          </motion.div>

          {/* Get in Touch */}
          <motion.div variants={itemVariants}>
            <h3 className="text-white font-grotesk font-bold text-lg mb-6">Get in Touch</h3>
            <ul className="space-y-4 text-gray-400">
              <li className="flex items-center">
                <i className="fas fa-envelope mr-3 text-[#0AEFFF]" />
                <a
                  href="mailto:support@seventy7kapital.com"
                  className="hover:text-[#0AEFFF] transition-colors duration-300"
                >
                  support@seventy7kapital.com
                </a>
              </li>
              <li className="flex items-center">
                <i className="fab fa-telegram mr-3 text-[#0AEFFF]" />
                <a
                  href="https://t.me/Access77bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0AEFFF] transition-colors duration-300"
                >
                  @Access77bot (Primary Support)
                </a>
              </li>
              <li className="flex items-center">
                <i className="fab fa-whatsapp mr-3 text-[#0AEFFF]" />
                <a
                  href="https://wa.me/2349030831907"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0AEFFF] transition-colors duration-300"
                >
                  +234 903 083 1907
                </a>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          variants={itemVariants}
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm"
        >
          <p className="text-gray-500 mb-4 md:mb-0">
            © {new Date().getFullYear()} Seventy7 Kapital. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-gray-500">
            <Link to="/privacy-policy" className="hover:text-[#0AEFFF] transition-colors duration-300">
              Privacy Policy
            </Link>
            <Link to="/terms-of-service" className="hover:text-[#0AEFFF] transition-colors duration-300">
              Terms of Service
            </Link>
            <Link to="/disclaimer" className="hover:text-[#0AEFFF] transition-colors duration-300">
              Risk Disclaimer
            </Link>
            <Link to="/cookie-policy" className="hover:text-[#0AEFFF] transition-colors duration-300">
              Cookie Policy
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default Footer;