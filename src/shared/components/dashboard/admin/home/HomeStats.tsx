'use client';
import React, { useRef } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

const HomeStats = () => {
  const chartRef = useRef(null);
  const legendItems = [
    { label: 'Awaiting Examiner', color: '#00A8FF' },
    { label: 'Assigned to Examiner', color: '#000093' },
    {
      label: 'Report Submitted',
      color: 'linear-gradient(277.26deg, #01F4C8 18.11%, #00A8FF 50.24%)',
    },
    { label: 'Report Delivered', color: '#E44646' },
    { label: 'Appointments Scheduled', color: '#01F4C8' },
  ];
  const chartData = {
    labels: legendItems.map(item => item.label),
    datasets: [
      {
        data: [10, 20, 30, 20, 40],
        backgroundColor: ctx => {
          const { chart, dataIndex } = ctx;
          if (dataIndex === 2) {
            const gradient = chart.ctx.createLinearGradient(0, 0, 200, 200);
            gradient.addColorStop(0, '#01F4C8');
            gradient.addColorStop(1, '#00A8FF');
            return gradient;
          }
          const colors = ['#00A8FF', '#000093', null, '#E44646', '#01F4C8'];
          return colors[dataIndex];
        },
        borderWidth: 0,
        cutout: '82%',
        spacing: 5,
        borderRadius: 50,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      tooltip: { enabled: false },
    },
  };

  return (
    <div className="flex items-center justify-between rounded-4xl bg-white py-6 pr-2 pl-4">
      <div className="space-y-3">
        {legendItems.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <span
              className="h-2 w-2 rounded-full"
              style={
                item.color.includes('linear-gradient')
                  ? { background: item.color }
                  : { backgroundColor: item.color }
              }
            />
            <span className="-mt-[2px] text-[9px] font-medium" style={{ color: '#444444' }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <div className="relative h-32 w-32">
        <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-[#25292A]">6.3K</span>
          <span className="text-sm text-[#8D9A9B]">Active Users</span>
        </div>
      </div>
    </div>
  );
};

export default HomeStats;
