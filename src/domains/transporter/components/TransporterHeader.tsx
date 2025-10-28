"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default function TransporterHeader() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Transporters</h1>
        <p className="text-gray-600">Manage medical transportation services</p>
      </div>
      <Link href="/transporter/create">
        <Button className="flex items-center gap-2 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white shadow-sm hover:from-[#00A8FF]/80 hover:to-[#01F4C8]/80">
          <Plus className="w-4 h-4" />
          Add Transporter
        </Button>
      </Link>
    </div>
  );
}
