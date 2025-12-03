import React from "react";
import { Metadata } from "next";
import ComingSoon from "@/components/ComingSoon";

export const metadata: Metadata = {
  title: "Support | Thrive - Examiner",
  description: "Access your support to manage your support tickets",
};

const SupportPage = () => {
  return (
    <div className="w-full max-w-5xl">
      <ComingSoon
        title="Support & Help Coming Soon"
        description="We're building a support system to help you manage your support tickets and get the help you need. This feature will be available soon!"
      />
    </div>
  );
};

export default SupportPage;
