"use client";
import React from "react";
import { useSession } from "next-auth/react";

const Header = () => {
  const { data: session } = useSession();
  return (
    <div>
      <h1 className="text-4xl font-semibold">
        Welcome <span className="text-[#00A8FF]">{session?.user?.name}!</span>
      </h1>
      <p className="text-xl">
        Let’s complete a few steps to activate your dashboard.
      </p>
    </div>
  );
};

export default Header;
