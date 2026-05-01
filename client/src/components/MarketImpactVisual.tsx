import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const MarketImpactVisual = () => {
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true
  });

  const containerVariants = {
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
      transition: { duration: 0.7, ease: "easeOut" }
    }
  };

  const iconVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const [stats, setStats] = useState({
    markets: 0,
    strategies: 0,
    scenarios: 0,
    insights: 0
  });

  useEffect(() => {
    if (inView) {
      const interval = setInterval(() => {
        setStats(prevStats => {
          const newStats = { ...prevStats };

          if (newStats.markets < 85) {
            newStats.markets = Math.min(85, newStats.markets + 2);
          }
          if (newStats.strategies < 120) {
            newStats.strategies = Math.min(120, newStats.strategies + 3);
          }
          if (newStats.scenarios < 450) {
            newStats.scenarios = Math.min(450, newStats.scenarios + 10);
          }
          if (newStats.insights < 320) {
            newStats.insights = Math.min(320, newStats.insights + 8);
          }

          return newStats;
        });
      }, 30);

      return () => clearInterval(interval);
    }
  }, [inView]);

  useEffect(() => {
    if (!document.querySelector('script[src="https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js"]')) {
      const script = document.createElement("script");
      script.src = "https://widgets.tradingview-widget.com/w/en/tv-ticker-tape.js";
      script.type = "module";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const marketInsights = [
    {
      title: "Market Structure",
      content: "We identify higher highs and lower lows to determine trend direction before trading.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0AEFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    {
      title: "Smart Money Concepts",
      content: "Our strategies follow the footprints of institutional traders through order blocks and liquidity grabs.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0AEFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: "Risk Management",
      content: "Capital preservation is key. We only risk 1-2% per trade with predefined stop losses.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0AEFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622" />
        </svg>
      )
    },
    {
      title: "Psychological Edge",
      content: "Trading psychology separates winners from losers. We teach emotional control and consistency.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-[#0AEFFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3" />
        </svg>
      )
    }
  ];

  return (
    <div ref={ref} className="py-20 bg-gradient-to-b from-[#060714] to-[#0a0d1f] overflow-hidden relative">

      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-[#0AEFFF] rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#7E22CE] rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">

        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={containerVariants} className="text-center mb-16">
          <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-bold mb-6">
            Market <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0AEFFF] to-[#7E22CE]">Intelligence</span> & Insights
          </motion.h2>

          <motion.p variants={itemVariants} className="text-gray-300 max-w-3xl mx-auto text-lg">
            Our market intelligence combines technical analysis, macro awareness, and market psychology to help individuals better understand financial market dynamics.
          </motion.p>
        </motion.div>

        {/* TradingView Ticker Tape */}
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={containerVariants} className="mb-16">
          <motion.div variants={itemVariants} className="bg-[#0c1629] border border-gray-800 rounded-xl p-3 overflow-hidden">
            <div
              dangerouslySetInnerHTML={{
                __html: `<tv-ticker-tape symbols="FOREXCOM:SPXUSD,FOREXCOM:NSXUSD,FOREXCOM:DJI,FX:EURUSD,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD,CMCMARKETS:GOLD"></tv-ticker-tape>`
              }}
            />
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={containerVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">

          <motion.div variants={itemVariants} className="bg-[#0c1629] rounded-xl p-6 border border-gray-800 text-center">
            <h3 className="text-gray-400 text-sm uppercase mb-2">Markets Analysed</h3>
            <p className="text-3xl font-bold text-white">{stats.markets}+</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[#0c1629] rounded-xl p-6 border border-gray-800 text-center">
            <h3 className="text-gray-400 text-sm uppercase mb-2">Strategies Studied</h3>
            <p className="text-3xl font-bold text-white">{stats.strategies}+</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[#0c1629] rounded-xl p-6 border border-gray-800 text-center">
            <h3 className="text-gray-400 text-sm uppercase mb-2">Scenarios Reviewed</h3>
            <p className="text-3xl font-bold text-white">{stats.scenarios}+</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-[#0c1629] rounded-xl p-6 border border-gray-800 text-center">
            <h3 className="text-gray-400 text-sm uppercase mb-2">Insights Published</h3>
            <p className="text-3xl font-bold text-white">{stats.insights}+</p>
          </motion.div>

        </motion.div>

        {/* Knowledge Cards */}
        <motion.div initial="hidden" animate={inView ? "visible" : "hidden"} variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {marketInsights.map((insight, index) => (
            <motion.div key={index} variants={itemVariants} className="bg-[#0c1629] rounded-xl p-6 border border-gray-800">
              <div className="flex items-start">
                <div className="p-2 bg-[#06091a] rounded-lg mr-4">{insight.icon}</div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{insight.title}</h3>
                  <p className="text-gray-300">{insight.content}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </div>
  );
};

export default MarketImpactVisual;