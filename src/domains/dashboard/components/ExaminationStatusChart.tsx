'use client';
import { useEffect, useRef } from 'react';
import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js';

// Register Chart.js components
Chart.register(ArcElement, Tooltip, Legend, PieController);

const examinationData = [
  { name: 'Appointment', value: 45.9, count: 87, colors: ['#245DA2', '#0D223C'] },
  { name: 'Examiner Response', value: 23.2, count: 44, colors: ['#7348BD'] },
  { name: 'Reassignment', value: 8.3, count: 16, colors: ['#1FD65F'] },
  { name: 'Assigned', value: 6.9, count: 13, colors: ['#E2AC52'] },
  { name: 'Report', value: 5.4, count: 10, colors: ['#E44646'] },
];

const filteredData = examinationData.filter(item => item.value > 0);

const LegendDot = ({ colors }: { colors: string[] }) => {
  if (colors.length > 1) {
    return (
      <div
        className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
        style={{ background: `linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 100%)` }}
      />
    );
  }

  return (
    <div
      className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
      style={{ backgroundColor: colors[0] }}
    />
  );
};

const ExaminationStatusChart = () => {
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Create gradient for Appointment slice
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#245DA2');
    gradient.addColorStop(1, '#0D223C');

    // Destroy existing chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: filteredData.map(d => d.name),
        datasets: [
          {
            data: filteredData.map(d => d.value),
            backgroundColor: [gradient, '#7348BD', '#1FD65F', '#E2AC52', '#E44646'],
            borderWidth: 0,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'white',
            titleColor: '#1f2937',
            bodyColor: '#4b5563',
            borderColor: '#e5e7eb',
            borderWidth: 1,
            padding: 8,
            displayColors: false,
            callbacks: {
              label: context => {
                const item = filteredData[context.dataIndex];
                return [`Count: ${item.count}`, `Percentage: ${item.value.toFixed(1)}%`];
              },
            },
          },
        },
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  return (
    <div className="flex flex-col">
      <div className="w-full">
        <canvas ref={chartRef}></canvas>
      </div>

      <div className="mt-4 grid w-full grid-cols-3 gap-1 px-2">
        {filteredData.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <LegendDot colors={item.colors} />
            <div>
              <p className="truncate text-[9px] leading-tight text-gray-600">{item.name}</p>
              <p className="text-[11px] font-semibold text-gray-800">{item.count}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExaminationStatusChart;
