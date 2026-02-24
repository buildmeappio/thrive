'use client';

import { useRouter } from 'next/navigation';
import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function DashboardHeader() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      router.refresh(); // Revalidate server data without page reload
    } catch {
      toast.error('Failed to refresh data');
    } finally {
      // Keep spinning animation for a moment for visual feedback
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  return (
    <div className="dashboard-zoom-mobile mb-4 flex items-center justify-between gap-4 sm:mb-6">
      <h1 className="font-degular break-words text-[28px] font-semibold leading-tight text-[#000000] sm:text-[28px] lg:text-[36px]">
        Welcome To <span className="text-[#00A8FF]">Thrive</span> Admin Dashboard
      </h1>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="flex h-10 w-10 flex-shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] shadow-md transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-70 sm:h-12 sm:w-12"
        aria-label="Refresh dashboard data"
        title="Refresh data"
      >
        <RefreshCw
          className={`h-5 w-5 text-white sm:h-6 sm:w-6 ${isRefreshing ? 'animate-spin' : ''}`}
        />
      </button>
    </div>
  );
}
