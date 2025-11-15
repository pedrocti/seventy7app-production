// client/src/components/ChartArea.tsx
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

interface ChartData {
  name: string;
  value: number;
}

const ChartArea = ({ data }: { data: ChartData[] }) => {
  return (
    <div className="h-48 bg-[#0E1B2B]/50 rounded-2xl p-4 border border-[#1E293B]/50">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0AEFFF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#0AEFFF" stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <XAxis dataKey="name" tick={{ fill: "#9CA3AF" }} />
          <YAxis tick={{ fill: "#9CA3AF" }} />
          <Tooltip />
          <Area type="monotone" dataKey="value" stroke="#0AEFFF" fillOpacity={1} fill="url(#colorUv)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartArea;
