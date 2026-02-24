'use client';

import { X } from 'lucide-react';
// COMMENTED OUT: Admin signature and review date removed
// import { useState } from "react";
// import { useAdminSignatureCanvas } from "./hooks/useAdminSignatureCanvas";

type AdminReviewFormProps = {
  onClose: () => void;
  onSubmit: (signatureImage: string, reviewDate: string) => Promise<void>;
  isLoading?: boolean;
};

export default function AdminReviewForm({
  onClose,
  onSubmit,
  isLoading = false,
}: AdminReviewFormProps) {
  // COMMENTED OUT: Admin signature canvas removed
  // const { canvasRef, signatureImage, clearSignature, validateSignature } =
  //   useAdminSignatureCanvas();

  // COMMENTED OUT: Review date removed
  // const today = new Date().toISOString().split("T")[0];
  // const [reviewDate, setReviewDate] = useState(today);

  const handleSubmit = async () => {
    // COMMENTED OUT: No validation needed, just submit with empty values
    // if (!validateSignature()) {
    //   return;
    // }
    // if (!signatureImage) {
    //   return;
    // }
    // Submit with empty signature and current date
    const today = new Date().toISOString().split('T')[0];
    await onSubmit('', today);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="relative flex w-full max-w-[500px] flex-col rounded-[20px] bg-white p-6 shadow-lg md:p-8"
        style={{
          boxShadow: '0px 0px 36.35px 0px #00000008',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-gray-100 disabled:opacity-50"
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="mb-6 border-b-2 border-[#00A8FF] pb-3">
          <h2 className="font-poppins text-2xl font-semibold text-black md:text-[24px]">
            Review Signed Contract
          </h2>
        </div>

        {/* Form */}
        <div className="flex-1 space-y-5 overflow-y-auto">
          {/* COMMENTED OUT: Review Date input removed */}
          {/* <div>
            <label className="block text-sm font-semibold text-black mb-2 font-poppins">
              Review Date
            </label>
            <input
              type="date"
              value={reviewDate}
              onChange={(e) => setReviewDate(e.target.value)}
              disabled={isLoading}
              className="mt-2 flex h-[55px] w-full items-center rounded-[10px] border-none bg-[#F2F5F6] px-3 text-sm text-[#333] placeholder:text-[14px] placeholder:text-[#9EA9AA] focus-visible:ring-2 focus-visible:ring-[#00A8FF]/30 focus-visible:ring-offset-0 focus-visible:outline-none disabled:opacity-50 font-poppins"
            />
          </div> */}

          {/* COMMENTED OUT: Admin Signature canvas removed */}
          {/* <div>
            <label className="block text-sm font-semibold text-black mb-2 font-poppins">
              Admin Signature
            </label>
            <div className="border-2 border-[#00A8FF] rounded-[10px] p-1 bg-white">
              <canvas
                ref={canvasRef}
                width={320}
                height={140}
                className="w-full cursor-crosshair bg-[#F2F5F6] rounded-[8px]"
                style={{ touchAction: "none" }}
              />
            </div>
            <button
              onClick={clearSignature}
              disabled={isLoading}
              className="mt-2 text-sm text-[#00A8FF] hover:text-[#0088CC] font-semibold underline transition-colors disabled:opacity-50 font-poppins"
            >
              Clear Signature
            </button>
          </div> */}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className={`font-poppins w-full rounded-lg px-4 py-3 text-base font-semibold text-white transition-all ${
              !isLoading
                ? 'cursor-pointer shadow-md hover:scale-[1.02] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/40'
                : 'cursor-not-allowed bg-gray-400'
            }`}
            style={
              !isLoading
                ? {
                    background: 'linear-gradient(270deg, #89D7FF 0%, #00A8FF 100%)',
                  }
                : {}
            }
          >
            {isLoading ? 'Processing...' : 'Confirm Contract'}
          </button>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="font-poppins w-full rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-base font-semibold text-gray-600 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
