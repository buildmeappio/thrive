"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function TransporterHeader() {
  return (
    <div className="flex items-center justify-between mb-4 sm:mb-6">
      <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
        Transporters
      </h1>
      <Link href="/transporter/create" className="scale-80 sm:scale-100">
        <Button className="flex items-center gap-2 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white shadow-sm hover:from-[#00A8FF]/80 hover:to-[#01F4C8]/80">
          <Plus className="w-4 h-4" />
          Add Transporter
        </Button>
      </Link>
    </div>
  );
}
