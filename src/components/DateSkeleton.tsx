import React from 'react';

const TimeSlotSkeleton: React.FC = () => {
  return (
    <div className="flex animate-pulse space-x-12">
      <div className="flex flex-wrap items-center space-x-2">
        <div className="h-8 w-20 rounded-lg bg-gray-200 p-2.5"></div>
        <div className="h-10 w-32 rounded-lg bg-gray-200 p-2.5"></div>
      </div>
      <div className="flex flex-wrap items-center space-x-2">
        <div className="h-8 w-20 rounded-lg bg-gray-200 p-2.5"></div>
        <div className="h-10 w-32 rounded-lg bg-gray-200 p-2.5"></div>
      </div>
    </div>
  );
};

const WeeklyScheduleSkeleton: React.FC = () => {
  // Array of days to match the original component
  const days = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];

  return (
    <div className="mt-12 animate-pulse bg-[#FCFDFF]">
      <div className="">
        {days.map(day => (
          <div key={day} className="flex flex-col items-start space-x-12 pb-4 sm:flex-row">
            <div className="mt-2 flex items-center space-x-1">
              {/* Checkbox skeleton */}
              <div className="mr-2 h-4 w-4 rounded bg-gray-200"></div>
              {/* Day name skeleton */}
              <div className="h-6 w-20 rounded bg-gray-200"></div>
            </div>

            <div className="mt-2 flex-1 sm:mt-0">
              <div className="space-y-4">
                {/* Time slots skeleton - showing one slot per day */}
                <div className="flex flex-wrap items-center space-x-4">
                  {/* Start time input skeleton */}
                  <div className="h-10 w-28 rounded-lg bg-gray-200 p-2.5"></div>
                  {/* End time input skeleton */}
                  <div className="h-10 w-28 rounded-lg bg-gray-200 p-2.5"></div>
                  {/* Icons skeleton */}
                  <div className="h-5 w-5 rounded-full bg-gray-200"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex w-full justify-end">
        {/* Save button skeleton */}
        <div className="mt-4 h-10 w-[128px] rounded-full bg-gray-200"></div>
      </div>
    </div>
  );
};

const Skeleton = {
  TimeSlot: TimeSlotSkeleton,
  WeeklySchedule: WeeklyScheduleSkeleton,
};

export default Skeleton;
