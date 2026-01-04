import React from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
  XAxis,
  Tooltip,
} from "recharts";
import { Link } from "wouter";

const barData = [
  { name: "1", value: 20 },
  { name: "2", value: 50 },
  { name: "3", value: 70 },
  { name: "4", value: 90 },
];

const lineData = [
  { name: "1", value: 15 },
  { name: "2", value: 40 },
  { name: "3", value: 65 },
  { name: "4", value: 85 },
];

const areaData = [
  { name: "1", value: 10 },
  { name: "2", value: 35 },
  { name: "3", value: 55 },
  { name: "4", value: 75 },
];

const radialData = [{ name: "Progress", value: 78, fill: "#0AEFFF" }];

const offerings = [
  {
    title: "Invest & Earn",
    subtitle: "Curated investment paths emphasizing steady, compounding growth.",
    link: "/invest",
    type: "bar",
    data: barData,
    icon: "fa-coins",
    gradient: "from-cyan-500/20 to-blue-800/10",
  },
  {
    title: "Portfolio Management",
    subtitle: "Professionally managed portfolios tailored to your goals.",
    link: "/portfolio",
    type: "line",
    data: lineData,
    icon: "fa-wallet",
    gradient: "from-blue-600/20 to-indigo-800/10",
  },
  {
    title: "Community",
    subtitle: "Join our active community for real-time market insights, discussions, and shared opportunities.",
    link: "/signal",
    type: "area",
    data: areaData,
    icon: "fa-signal",
    gradient: "from-indigo-600/20 to-purple-700/10",
  },
  {
    title: "Mentorship",
    subtitle: "Personalized mentorship to elevate your trading mastery.",
    link: "/mentorship",
    type: "radial",
    data: radialData,
    icon: "fa-graduation-cap",
    gradient: "from-purple-600/20 to-cyan-700/10",
  },
];

const renderChart = (type: string, data: any) => {
  switch (type) {
    case "bar":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: -16, right: 0, top: 6, bottom: 6 }}>
            <XAxis dataKey="name" tick={false} axisLine={false} />
            <Tooltip wrapperStyle={{ background: "#0B1324", borderRadius: 8, border: "none" }} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#0AEFFF" />
          </BarChart>
        </ResponsiveContainer>
      );
    case "line":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="name" tick={false} axisLine={false} />
            <Tooltip wrapperStyle={{ background: "#0B1324", borderRadius: 8, border: "none" }} />
            <Line type="monotone" dataKey="value" stroke="#0AEFFF" strokeWidth={3} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      );
    case "area":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <XAxis dataKey="name" tick={false} axisLine={false} />
            <Tooltip wrapperStyle={{ background: "#0B1324", borderRadius: 8, border: "none" }} />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0AEFFF"
              fill="url(#colorArea)"
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="colorArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0AEFFF" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#0AEFFF" stopOpacity={0} />
              </linearGradient>
            </defs>
          </AreaChart>
        </ResponsiveContainer>
      );
    case "radial":
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="50%"
            outerRadius="100%"
            barSize={12}
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar background dataKey="value" cornerRadius={10} />
          </RadialBarChart>
        </ResponsiveContainer>
      );
    default:
      return null;
  }
};

const Card = ({ item, i }: { item: any; i: number }) => (
  <motion.article
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, amount: 0.2 }}
    transition={{ delay: 0.08 * i, duration: 0.6 }}
    className={`group bg-gradient-to-br ${item.gradient} border border-cyan-400/10 hover:border-cyan-400/40 rounded-2xl p-6 shadow-md hover:shadow-cyan-500/20 transition-transform transform hover:-translate-y-2 relative overflow-hidden`}
  >
    <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-400/10 blur-2xl rounded-full -z-0"></div>

    <div className="relative z-10 flex flex-col justify-between h-full">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center bg-[#07192f] border border-cyan-400/20">
          <i className={`fas ${item.icon} text-2xl text-[#0AEFFF]`}></i>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-1">{item.title}</h3>
          <p className="text-sm text-gray-300 mb-4">{item.subtitle}</p>
        </div>
      </div>

      <div className="w-full h-24">{renderChart(item.type, item.data)}</div>

      <div className="mt-4 flex justify-end">
        <Link
          href={item.link}
          className="inline-flex items-center gap-2 text-sm text-[#0AEFFF] font-medium hover:underline"
        >
          Learn more
          <i className="fas fa-arrow-right text-sm opacity-80"></i>
        </Link>
      </div>
    </div>
  </motion.article>
);

export default function CoreOfferingsSection() {
  return (
    <section
      id="core-offerings"
      className="py-20 lg:py-24 bg-[#0F172A] relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none"></div>
      <div className="absolute -top-32 left-0 w-96 h-96 bg-gradient-to-tr from-[#0AEFFF]/10 to-transparent blur-3xl"></div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-grotesk font-bold mb-3">
            Explore Our <span className="gradient-text">Core Offerings</span>
          </h2>
          <p className="text-gray-300">
            Distinctive, premium services — each with interactive insights and quick access to the right destination.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {offerings.map((o, i) => (
            <Card key={o.title} item={o} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
