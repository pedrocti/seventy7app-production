import { motion, useAnimation } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const TradingVisuals = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true });

  // Chart data generation
  const [chartData1, setChartData1] = useState<number[]>([]);
  const [chartData2, setChartData2] = useState<number[]>([]);

  // Generate random chart data that resembles a bullish trend
  useEffect(() => {
    const generateBullishData = (pointCount: number, volatility: number) => {
      const data: number[] = [];
      let value = 50 + Math.random() * 10;

      for (let i = 0; i < pointCount; i++) {
        // Slight upward trend with volatility
        const change = (Math.random() - 0.3) * volatility;
        value = Math.max(10, Math.min(90, value + change));
        data.push(value);
      }

      return data;
    };

    // Generate bearish data (generally downtrend)
    const generateBearishData = (pointCount: number, volatility: number) => {
      const data: number[] = [];
      let value = 70 + Math.random() * 10;

      for (let i = 0; i < pointCount; i++) {
        // Slight downward trend with volatility
        const change = (Math.random() - 0.6) * volatility;
        value = Math.max(10, Math.min(90, value + change));
        data.push(value);
      }

      return data;
    };

    setChartData1(generateBullishData(30, 5));
    setChartData2(generateBearishData(30, 5));
  }, []);

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
        staggerChildren: 0.1,
        delayChildren: 0.3,
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

  // Format chart data as SVG path
  const getChartPath = (data: number[], width: number, height: number) => {
    if (data.length === 0) return '';

    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (value / 100) * height;
      return `${x},${y}`;
    });

    return `M0,${height} L${points.join(' L')} L${width},${height} Z`;
  };

  // Create a candlestick representation
  const generateCandlesticks = (count: number) => {
    const candlesticks = [];

    for (let i = 0; i < count; i++) {
      const isBullish = Math.random() > 0.4; // More bullish than bearish
      const height = 30 + Math.random() * 60;
      const wickHeight = 15 + Math.random() * 30;

      candlesticks.push({
        isBullish,
        bodyHeight: height,
        wickHeight: wickHeight,
        x: (i * 20) + 10
      });
    }

    return candlesticks;
  };

  const candlesticks = generateCandlesticks(15);

  // Trading terms for the rotating display
  const tradingTerms = [
    "Support & Resistance",
    "Price Action",
    "Trend Analysis",
    "Breakouts",
    "Risk Management",
    "Market Structure",
    "Technical Analysis",
    "Liquidity Zones",
    "Order Blocks",
    "Smart Money Concepts"
  ];

  return (
    <section
      ref={ref}
      className="pt-8 lg:pt-12 pb-16 lg:pb-20 overflow-hidden bg-gradient-to-b from-[#0c0e20] to-[#020617]"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={controls}
        className="w-full"
      >
        <div className="container mx-auto px-4">
          <motion.div variants={itemVariants} className="max-w-4xl mx-auto mb-10 lg:mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Trading with <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#0AEFFF] to-[#7E22CE]">Precision</span>
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Our strategic approach combines technical analysis with market psychology to identify high-probability trading opportunities.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10 lg:mb-12">
            {/* Bull Market Visualization */}
            <motion.div
              variants={itemVariants}
              className="bg-[#0c1629] rounded-xl p-6 border border-gray-800 relative overflow-hidden group hover:border-[#0AEFFF] transition-colors duration-300"
            >
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Bull Market Strategy</h3>
                <div className="flex items-center">
                  <span className="inline-block h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                  <span className="text-green-500 font-medium">+24.6%</span>
                </div>
              </div>

              <div className="relative h-64 w-full mb-4">
                {/* Chart background grid */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-4">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="border-t border-l border-gray-800"></div>
                  ))}
                </div>

                {/* Chart */}
                <svg width="100%" height="100%" viewBox="0 0 600 240" preserveAspectRatio="none">
                  {/* Background area */}
                  <defs>
                    <linearGradient id="bullGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#0AEFFFaa" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#0AEFFF00" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={getChartPath(chartData1, 600, 240)}
                    fill="url(#bullGradient)"
                    stroke="#0AEFFF"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Animated pulse indicator */}
                <div className="absolute right-4 top-4 flex flex-col items-end">
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-green-500 rounded-full opacity-20 animate-pulse"></div>
                    <div className="relative h-3 w-3 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-sm text-green-500 mt-1">Live</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#06091a] rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Breakout Zones</p>
                  <p className="text-white font-bold text-lg">16 Identified</p>
                </div>
                <div className="bg-[#06091a] rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Success Rate</p>
                  <p className="text-white font-bold text-lg">84.3%</p>
                </div>
              </div>

              {/* Glowing effect on hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#0AEFFF] to-[#7E22CE] opacity-0 group-hover:opacity-20 rounded-xl blur-lg transition-opacity duration-500"></div>
            </motion.div>

            {/* Bear Market Visualization */}
            <motion.div
              variants={itemVariants}
              className="bg-[#0c1629] rounded-xl p-6 border border-gray-800 relative overflow-hidden group hover:border-[#FF4A8D] transition-colors duration-300"
            >
              <div className="mb-4 flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Bear Market Defense</h3>
                <div className="flex items-center">
                  <span className="inline-block h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                  <span className="text-red-500 font-medium">Protected</span>
                </div>
              </div>

              <div className="relative h-64 w-full mb-4">
                {/* Chart background grid */}
                <div className="absolute inset-0 grid grid-cols-6 grid-rows-4">
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="border-t border-l border-gray-800"></div>
                  ))}
                </div>

                {/* Chart */}
                <svg width="100%" height="100%" viewBox="0 0 600 240" preserveAspectRatio="none">
                  {/* Background area */}
                  <defs>
                    <linearGradient id="bearGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#FF4A8Daa" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#FF4A8D00" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d={getChartPath(chartData2, 600, 240)}
                    fill="url(#bearGradient)"
                    stroke="#FF4A8D"
                    strokeWidth="2"
                    strokeLinejoin="round"
                  />
                </svg>

                {/* Animated pulse indicator */}
                <div className="absolute right-4 top-4 flex flex-col items-end">
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-red-500 rounded-full opacity-20 animate-pulse"></div>
                    <div className="relative h-3 w-3 bg-red-500 rounded-full"></div>
                  </div>
                  <span className="text-sm text-red-500 mt-1">Protected</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#06091a] rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Risk Reduction</p>
                  <p className="text-white font-bold text-lg">76.2%</p>
                </div>
                <div className="bg-[#06091a] rounded-lg p-4">
                  <p className="text-gray-400 text-sm mb-1">Drawdown Limited</p>
                  <p className="text-white font-bold text-lg">-12.4%</p>
                </div>
              </div>

              {/* Glowing effect on hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#FF4A8D] to-[#7E22CE] opacity-0 group-hover:opacity-20 rounded-xl blur-lg transition-opacity duration-500"></div>
            </motion.div>
          </div>

          {/* Candlestick Pattern */}
          <motion.div variants={itemVariants} className="mb-10 lg:mb-12">
            <div className="bg-[#0c1629] rounded-xl p-6 border border-gray-800 overflow-hidden">
              <h3 className="text-xl font-bold text-white mb-4">Price Action Patterns</h3>

              <div className="relative h-40 w-full">
                <svg width="100%" height="100%" viewBox="0 0 600 160">
                  {/* Grid lines */}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <line
                      key={i}
                      x1="0"
                      y1={i * 40}
                      x2="600"
                      y2={i * 40}
                      stroke="#1e293b"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Candlesticks */}
                  {candlesticks.map((candle, i) => (
                    <g key={i}>
                      {/* Wick */}
                      <line
                        x1={candle.x}
                        y1={80 - candle.wickHeight}
                        x2={candle.x}
                        y2={80 + candle.wickHeight}
                        stroke={candle.isBullish ? "#10b981" : "#ef4444"}
                        strokeWidth="1"
                      />

                      {/* Body */}
                      <rect
                        x={candle.x - 5}
                        y={80 - (candle.isBullish ? candle.bodyHeight/2 : 0)}
                        width="10"
                        height={candle.bodyHeight * (candle.isBullish ? 0.5 : 0.7)}
                        fill={candle.isBullish ? "#10b981" : "#ef4444"}
                      />
                    </g>
                  ))}

                  {/* Support line */}
                  <line
                    x1="0"
                    y1="130"
                    x2="600"
                    y2="130"
                    stroke="#0AEFFF"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />

                  {/* Resistance line */}
                  <line
                    x1="0"
                    y1="40"
                    x2="600"
                    y2="40"
                    stroke="#FF4A8D"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />

                  {/* Annotations */}
                  <text x="10" y="38" fill="#FF4A8D" fontSize="12">Resistance</text>
                  <text x="10" y="128" fill="#0AEFFF" fontSize="12">Support</text>
                </svg>
              </div>

              {/* Pattern recognition descriptions */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center">
                  <span className="inline-block h-4 w-4 rounded-sm bg-green-500 mr-2"></span>
                  <span className="text-white">Engulfing</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block h-4 w-4 rounded-sm bg-purple-500 mr-2"></span>
                  <span className="text-white">Doji</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block h-4 w-4 rounded-sm bg-blue-400 mr-2"></span>
                  <span className="text-white">Pin Bar</span>
                </div>
                <div className="flex items-center">
                  <span className="inline-block h-4 w-4 rounded-sm bg-yellow-500 mr-2"></span>
                  <span className="text-white">Inside Bar</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Trading terms rotating display */}
          <motion.div
            variants={itemVariants}
            className="bg-[#0c1629] rounded-xl p-6 border border-gray-800 text-center overflow-hidden"
          >
            <h3 className="text-xl font-bold text-white mb-8">Trading Concepts We Master</h3>

            <div className="flex flex-wrap justify-center gap-4 md:gap-6">
              {tradingTerms.map((term, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0.3, scale: 0.9 }}
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.9, 1.05, 0.9],
                    color: ["#6b7280", "#0AEFFF", "#6b7280"]
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    delay: index * 0.5,
                    ease: "easeInOut"
                  }}
                  className="bg-[#06091a] rounded-lg px-4 py-2 border border-gray-800"
                >
                  {term}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default TradingVisuals;