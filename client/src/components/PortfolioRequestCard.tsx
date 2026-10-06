// client/src/components/PortfolioRequestCard.tsx
const PortfolioRequestCard = () => {
  return (
    <div className="rounded-2xl p-4 bg-brand-secondary/60 border border-[#1E293B]/40">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-sm text-gray-300">Portfolio Management</div>
          <div className="text-lg font-semibold">Request professional portfolio management</div>
        </div>
        <button className="bg-[#0AEFFF] text-brand-secondary px-4 py-2 rounded-full font-semibold">Request PM</button>
      </div>
      <div className="text-gray-400 text-sm">
        Request portfolio management and our team will review, allocate funds, and periodically update trade results. Admin will publish trade outcomes and distribution percentages so investors can see profit/loss per trade.
      </div>
    </div>
  );
};

export default PortfolioRequestCard;
