"use client";

import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function DashboardHeader() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      router.refresh(); // Revalidate server data without page reload
    } catch {
      toast.error("Failed to refresh data");
    } finally {
      // Keep spinning animation for a moment for visual feedback
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="mb-4 sm:mb-6 dashboard-zoom-mobile flex items-center justify-between gap-4">
      <h1 className="text-[#000000] text-[28px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
        Welcome To <span className="text-[#00A8FF]">Thrive</span> Admin
        Dashboard
      </h1>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] flex items-center justify-center shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
        aria-label="Refresh dashboard data"
        title="Refresh data"
      >
        <RefreshCw
          className={`w-5 h-5 sm:w-6 sm:h-6 text-white ${isRefreshing ? "animate-spin" : ""}`}
        />
      </button>
    </div>
  );
}
