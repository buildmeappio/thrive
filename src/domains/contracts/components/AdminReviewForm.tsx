"use client";

import { X } from "lucide-react";
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
    const today = new Date().toISOString().split("T")[0];
    await onSubmit("", today);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className="relative w-full max-w-[500px] rounded-[20px] bg-white p-6 md:p-8 shadow-lg flex flex-col"
        style={{
          boxShadow: "0px 0px 36.35px 0px #00000008",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Header */}
        <div className="border-b-2 border-[#00A8FF] pb-3 mb-6">
          <h2 className="text-2xl md:text-[24px] font-semibold text-black font-poppins">
            Review Signed Contract
          </h2>
        </div>

        {/* Form */}
        <div className="space-y-5 flex-1 overflow-y-auto">
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
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white text-base transition-all font-poppins ${
              !isLoading
                ? "cursor-pointer shadow-md hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-[#00A8FF]/40"
                : "bg-gray-400 cursor-not-allowed"
            }`}
            style={
              !isLoading
                ? {
                    background:
                      "linear-gradient(270deg, #89D7FF 0%, #00A8FF 100%)",
                  }
                : {}
            }
          >
            {isLoading ? "Processing..." : "Confirm Contract"}
          </button>

          {/* Cancel Button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-lg font-semibold text-gray-600 text-base transition-all border-2 border-gray-300 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed font-poppins"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
