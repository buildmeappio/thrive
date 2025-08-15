import {
  HomeStats,
  HomeCards,
  HomeDataTable,
  HomeRecentUpdates,
} from '@/shared/components/dashboard/admin/home';
import React from 'react';

export default function AdminDashboardPage() {
  return (
    <div className="py- flex gap-4 px-2">
      <div className="flex w-[70%] flex-col gap-6">
        <HomeCards />
        <HomeDataTable />
      </div>
      <div className="flex w-[30%] flex-col gap-6 mt-14">
        <HomeRecentUpdates />
        <HomeStats />
      </div>
    </div>
  );
}
