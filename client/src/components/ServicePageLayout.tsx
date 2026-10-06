import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface ServicePageLayoutProps {
  title: string;
  subtitle: string;
  chartData: { name: string; value: number }[];
  ctaText: string;
  ctaLink: string;
}

const ServicePageLayout = ({
  title,
  subtitle,
  chartData,
  ctaText,
  ctaLink,
}: ServicePageLayoutProps) => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-white bg-brand-secondary px-6 py-16 relative overflow-hidden"
      style={{
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Title Section */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-6xl font-bold mb-4 text-[#0AEFFF]">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          {subtitle}
        </p>
      </motion.div>

      {/* Chart Section */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="w-full max-w-3xl mb-16"
      >
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" stroke="#ccc" />
            <YAxis stroke="#ccc" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1E293B",
                border: "none",
                borderRadius: "10px",
              }}
            />
            <Bar
              dataKey="value"
              fill="url(#barGradient)"
              radius={[10, 10, 0, 0]}
            />
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0AEFFF" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#0AEFFF" stopOpacity={0.3} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* CTA Button */}
      <motion.a
        href={ctaLink}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-[#0AEFFF] text-brand-secondary font-semibold px-8 py-4 rounded-full shadow-lg transition-all hover:shadow-cyan-500/50"
      >
        {ctaText}
      </motion.a>
    </div>
  );
};

export default ServicePageLayout;
