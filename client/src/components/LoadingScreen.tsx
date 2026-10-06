import { motion } from 'framer-motion';
import logoImage from '../assets/logo.jpeg';

const LoadingScreen = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-brand-secondary flex justify-center items-center z-9999">
      <div className="text-center">
        <div className="relative mx-auto mb-8">
          <motion.div 
            className="absolute -inset-0.5 bg-linear-to-r from-[#0AEFFF] to-[#7E22CE] rounded-full blur-md"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="w-24 h-24 rounded-full relative flex items-center justify-center overflow-hidden"
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, 0, -5, 0]
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            <img 
              src={logoImage} 
              alt="Seventy7 Kapital Logo" 
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
        <motion.p 
          className="text-white text-xl font-grotesk"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Loading Experience...
        </motion.p>
      </div>
    </div>
  );
};

export default LoadingScreen;
