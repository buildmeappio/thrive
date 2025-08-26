import HomeSummary from '@/shared/components/dashboard/medicalExaminer/home/HomeSummary';
import HomeTables from '@/shared/components/dashboard/medicalExaminer/home/HomeTables';
import RecentUpdates from '@/shared/components/dashboard/medicalExaminer/home/RecentUpdates';
import React from 'react';

export default function MedicalExaminerDashboardPage() {
  return (
    <div className='flex justify-between gap-4 flex-col md:flex-row'>
      <div className='flex-2'>
        <HomeTables />
      </div>
      <div className='flex-1 flex flex-col gap-6 mt-6 md:mt-18 '>
        <RecentUpdates />
        <HomeSummary />
      </div>
    </div>
  );
}
