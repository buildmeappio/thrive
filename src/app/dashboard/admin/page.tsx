import {
  HomeStats,
  HomeCards,
  HomeDataTable,
  HomeRecentUpdates,
} from '@/shared/components/dashboard/admin/home';
import React from 'react';

export default function AdminDashboardPage() {
  return (
    <div className="py- flex gap-4 px-2 max-sm:flex-col max-sm:gap-6">
      <div className="flex w-[70%] flex-col gap-6 max-sm:w-full">
        <HomeCards />
        <HomeDataTable />
      </div>
      <div className="flex w-[30%] flex-col gap-6 mt-14 max-sm:w-full max-sm:mt-0">
        <HomeRecentUpdates />
        <HomeStats />
      </div>
    </div>
  );
}
