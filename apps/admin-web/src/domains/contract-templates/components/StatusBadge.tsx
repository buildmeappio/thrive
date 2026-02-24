import { Check, X } from 'lucide-react';

type StatusBadgeProps = {
  isActive: boolean;
  className?: string;
};

// Helper function to wrap icon in gradient circle with overlay
const GradientIcon = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]">
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: '#00E1B8', opacity: 0.5 }}
      ></div>
      <div className="relative z-10 text-white">{children}</div>
    </div>
  );
};

export default function StatusBadge({ isActive, className }: StatusBadgeProps) {
  return (
    <div
      className={`w-fit rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] px-[2px] py-[2px] ${className || ''}`}
    >
      <div
        className="flex items-center gap-2 rounded-full px-4 py-2"
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 600,
          fontSize: '14px',
          color: '#004766',
          backgroundColor: '#E0F7F4',
        }}
      >
        {isActive ? (
          <>
            <GradientIcon>
              <Check className="h-3 w-3" />
            </GradientIcon>
            <span style={{ color: '#004766' }}>Active</span>
          </>
        ) : (
          <>
            <GradientIcon>
              <X className="h-3 w-3" />
            </GradientIcon>
            <span style={{ color: '#004766' }}>Inactive</span>
          </>
        )}
      </div>
    </div>
  );
}
