import { Button } from '@/components/ui';
import { Bell, Circle } from 'lucide-react';

const UpdatesPanel = ({ items }: { items: string[] }) => {
  return (
    <div className="w-full rounded-[29px] bg-white px-6 py-4 shadow-[0_0_36.92px_rgba(0,0,0,0.08)]">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center rounded-full bg-[#EEEEFF] p-1">
            <Bell className="h-[18px] w-[18px] fill-[#000093] text-[#000093]" />
          </div>
          <h3 className="text-[18.64px] leading-[100%] font-medium tracking-[-0.02em] text-black">
            Recent Updates
          </h3>
        </div>
        <Button className="h-[30px] w-[84px] rounded-full bg-[#000093] text-[12px] font-medium text-white">
          View All
        </Button>
      </div>
      <ul className="mb-4 space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex items-center gap-2 rounded-md bg-[#F2F2F2] px-2 py-2">
            <Circle className="h-[9px] w-[9px] fill-[#000093] text-[#000093]" />
            <span className="text-[13px] leading-[100%] font-normal tracking-[-0.02em] text-[#444444]">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
export default UpdatesPanel;
