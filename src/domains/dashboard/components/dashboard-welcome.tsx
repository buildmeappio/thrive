"use client";
import React from "react";
import { useSession } from "next-auth/react";
import ActivationSteps from "./activation-steps";

const DashboardWelcome = () => {
  const { data: session } = useSession();

  return (
    <div className="max-w-4xl">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-semibold mb-2">
          Welcome,{" "}
          <span className="text-[#00A8FF]">
            {session?.user?.name || "Dr Sarah"}!
          </span>
        </h1>
        <p className="text-lg text-gray-600">
          Let's complete a few steps to activate your dashboard.
        </p>
      </div>

      {/* Activation Steps */}
      <ActivationSteps />
    </div>
  );
};

export default DashboardWelcome;
