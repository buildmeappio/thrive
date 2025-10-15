"use client";
import React from "react";

export interface HeaderProps {
  userName: string;
}

const Header: React.FC<HeaderProps> = ({ userName }) => {
  return (
    <div>
      <h1 className="text-4xl font-semibold">
        Welcome <span className="text-[#00A8FF]">{userName}!</span>
      </h1>
      <p className="text-xl">
        Let&apos;s complete a few steps to activate your dashboard.
      </p>
    </div>
  );
};

export default Header;
