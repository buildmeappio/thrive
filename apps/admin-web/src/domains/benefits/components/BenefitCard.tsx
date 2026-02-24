'use client';

import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { BenefitData } from '../types/Benefit';

type BenefitCardProps = {
  benefit: BenefitData;
  onEdit: (benefit: BenefitData) => void;
  onDelete: (benefit: BenefitData) => void;
};

export default function BenefitCard({ benefit, onEdit, onDelete }: BenefitCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
          {benefit.examinationTypeName}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(benefit)}
            className="rounded-lg p-2 transition-colors hover:bg-gray-100"
            title="Edit"
          >
            <Edit className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(benefit)}
            className="rounded-lg p-2 transition-colors hover:bg-red-50"
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{benefit.benefit}</h3>
      {benefit.description ? (
        <p className="font-poppins text-sm text-gray-600">{benefit.description}</p>
      ) : (
        <p className="font-poppins text-sm italic text-gray-400">N/A</p>
      )}
    </div>
  );
}
