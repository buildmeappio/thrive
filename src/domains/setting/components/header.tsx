"use client";
import React from "react";

export interface HeaderProps {
  userName: string;
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
  return (
    <div className="mb-4 md:mb-6">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold">
        Welcome <span className="text-[#00A8FF]">Dr. {userName}!</span>
      </h1>
    </div>
  );
};

export default Header;
