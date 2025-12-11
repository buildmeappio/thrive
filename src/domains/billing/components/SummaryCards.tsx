"use client";

import { DollarSign, FileText, Clock, CheckCircle } from "lucide-react";
import { BillingSummary } from "../types";

interface SummaryCardsProps {
  summary: BillingSummary;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      title: "Total Earnings",
      value: formatCurrency(summary.totalEarnings),
      icon: DollarSign,
      gradient: "from-[#00A8FF] to-[#01F4C8]",
    },
    {
      title: "Total Invoiced",
      value: formatCurrency(summary.totalInvoiced),
      icon: FileText,
      gradient: "from-[#00A8FF] to-[#01F4C8]",
    },
    {
      title: "Pending Payments",
      value: formatCurrency(summary.pendingPayments),
      icon: Clock,
      gradient: "from-[#00A8FF] to-[#01F4C8]",
    },
    {
      title: "Paid This Month",
      value: formatCurrency(summary.paidThisMonth),
      icon: CheckCircle,
      gradient: "from-[#00A8FF] to-[#01F4C8]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className="bg-white rounded-[28px] shadow-sm border border-gray-100 p-6 sm:p-8 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r ${card.gradient}`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                {card.title}
              </h3>
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-[#00A8FF] leading-tight">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

