import { LogOut, Bell } from "lucide-react";
import { useAuth } from "@/auth/AuthContext";

interface DashboardHeaderProps {
  username: string;
}

const DashboardHeader = ({ username }: DashboardHeaderProps) => {
  const { logout } = useAuth();

  return (
    <header className="flex justify-between items-center px-8 py-5 border-b border-[#1E293B]/60 backdrop-blur-lg">
      <h1 className="text-xl sm:text-2xl font-bold tracking-wide">
        77<span className="text-[#0AEFFF]">KAPITAL</span> INVESTOR
      </h1>
      <div className="flex items-center space-x-4">
        <button className="relative hover:text-[#0AEFFF]">
          <Bell size={22} />
          <span className="absolute top-0 right-0 bg-[#0AEFFF] rounded-full w-2 h-2" />
        </button>
        <button
          onClick={logout}
          className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-full transition"
        >
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default DashboardHeader;
