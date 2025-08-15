import {
  HomeStats,
  HomeCards,
  HomeDataTable,
  HomeRecentUpdates,
} from '@/shared/components/dashboard/admin/home';
import React from 'react';

export default function AdminDashboardPage() {
  return (
    <div className="flex gap-4 py-6 px-2">
      <div className="flex flex-col gap-4 flex-2">
        <HomeCards />
        <HomeDataTable />
      </div>
      <div className="flex flex-col gap-4 flex-1">
        <HomeRecentUpdates />
        <HomeStats />
      </div>
    </div>
  );
}
