'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

// Dummy data based on examination statuses
const examinationData = [
  { name: 'Appointment', value: 45.9, count: 87, color: 'url(#appointmentGradient)' },
  { name: 'Examiner Response', value: 23.2, count: 44, color: '#7348BD' },
  { name: 'Reassignment', value: 8.3, count: 16, color: '#1FD65F' },
  { name: 'Assigned', value: 6.9, count: 13, color: '#E2AC52' },
  { name: 'Report', value: 5.4, count: 10, color: '#E44646' },
];

// Filter out zero values for cleaner display
const filteredData = examinationData.filter(item => item.value > 0);

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-2 text-xs shadow-lg">
        <p className="font-semibold text-gray-800">{payload[0].name}</p>
        <p className="text-gray-600">Count: {payload[0].payload.count}</p>
        <p className="text-gray-600">Percentage: {payload[0].value.toFixed(1)}%</p>
      </div>
    );
  }
  return null;
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  if (percent < 0.05) return null;

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      className="text-xs font-semibold"
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

const LegendDot = ({ color, isGradient }: { color: string; isGradient?: boolean }) => {
  if (isGradient) {
    return (
      <div
        className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
        style={{ background: 'linear-gradient(180deg, #245DA2 0%, #0D223C 100%)' }}
      />
    );
  }

  const colorClasses: Record<string, string> = {
    '#7348BD': 'bg-[#7348BD]',
    '#1FD65F': 'bg-[#1FD65F]',
    '#E2AC52': 'bg-[#E2AC52]',
    '#E44646': 'bg-[#E44646]',
  };

  return (
    <div
      className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${colorClasses[color] || 'bg-gray-400'}`}
    />
  );
};

const ExaminationStatusChart = () => {
  return (
    <div className="flex flex-col">
      <div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <defs>
              <linearGradient id="appointmentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#245DA2" />
                <stop offset="100%" stopColor="#0D223C" />
              </linearGradient>
            </defs>
            <Pie
              data={filteredData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {filteredData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid w-full grid-cols-3 gap-1 px-2">
        {filteredData.map((item, index) => (
          <div key={index} className="flex items-center gap-1">
            <LegendDot color={item.color} isGradient={item.name === 'Appointment'} />
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
