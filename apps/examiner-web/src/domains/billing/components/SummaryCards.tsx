'use client';

import { DollarSign, FileText, Clock, CheckCircle } from 'lucide-react';
import { BillingSummary } from '../types';

interface SummaryCardsProps {
  summary: BillingSummary;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
  }).format(amount);
};

export default function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      title: 'Total Earnings',
      value: formatCurrency(summary.totalEarnings),
      icon: DollarSign,
      gradient: 'from-[#00A8FF] to-[#01F4C8]',
    },
    {
      title: 'Total Invoiced',
      value: formatCurrency(summary.totalInvoiced),
      icon: FileText,
      gradient: 'from-[#00A8FF] to-[#01F4C8]',
    },
    {
      title: 'Pending Payments',
      value: formatCurrency(summary.pendingPayments),
      icon: Clock,
      gradient: 'from-[#00A8FF] to-[#01F4C8]',
    },
    {
      title: 'Paid This Month',
      value: formatCurrency(summary.paidThisMonth),
      icon: CheckCircle,
      gradient: 'from-[#00A8FF] to-[#01F4C8]',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className="rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md sm:p-8"
          >
            <div className="mb-4 flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r ${card.gradient}`}
              >
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 sm:text-xl">{card.title}</h3>
            </div>
            <p className="text-2xl font-bold leading-tight text-[#00A8FF] sm:text-3xl">
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}
