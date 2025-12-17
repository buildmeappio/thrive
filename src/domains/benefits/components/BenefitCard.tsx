"use client";

import React from "react";
import { Edit, Trash2 } from "lucide-react";
import { BenefitData } from "../types/Benefit";

type BenefitCardProps = {
  benefit: BenefitData;
  onEdit: (benefit: BenefitData) => void;
  onDelete: (benefit: BenefitData) => void;
};

export default function BenefitCard({
  benefit,
  onEdit,
  onDelete,
}: BenefitCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
          {benefit.examinationTypeName}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(benefit)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(benefit)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {benefit.benefit}
      </h3>
      {benefit.description ? (
        <p className="text-sm text-gray-600 font-poppins">
          {benefit.description}
        </p>
      ) : (
        <p className="text-sm text-gray-400 font-poppins italic">N/A</p>
      )}
    </div>
  );
}
