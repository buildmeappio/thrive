import React from 'react';

/**
 * Helper component to wrap icon in gradient circle with overlay
 */
export const GradientIcon = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8]">
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: '#00E1B8', opacity: 0.5 }}
      ></div>
      <div className="relative z-10 flex items-center justify-center text-white">{children}</div>
    </div>
  );
};
