import { motion, AnimatePresence } from 'framer-motion';

const StickyCTA = ({ visible }: { visible: boolean }) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          className="fixed bottom-0 left-0 w-full glass-effect py-4 px-4 z-50"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.3 }}
        >
          <div className="container mx-auto flex justify-between items-center">
            <p className="text-white font-medium hidden sm:block">Get in touch with a Financial Expert</p>
            <a
              href="https://wa.me/2349030831907"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#0F172A] text-[#0AEFFF] px-10 py-4 rounded-full text-lg font-semibold hover:bg-[#16203B] transition-all shadow-lg inline-flex items-center justify-center gap-2"
            >
              <i className="fab fa-telegram"></i>
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default StickyCTA;
