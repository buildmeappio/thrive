import React from "react";

/**
 * Helper component to wrap icon in gradient circle with overlay
 */
export const GradientIcon = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative w-5 h-5 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: "#00E1B8", opacity: 0.5 }}
      ></div>
      <div className="relative z-10 text-white flex items-center justify-center">
        {children}
      </div>
    </div>
  );
};
