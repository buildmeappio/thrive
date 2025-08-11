import React, { useState, useEffect } from "react";
import ContinueButton from "~/components/ui/ContinueButton";
import BackButton from "~/components/ui/BackButton";
import type { MedExaminerRegStepProps } from "~/types";

export const Step7SubmitConfirmation: React.FC<MedExaminerRegStepProps> = ({
  onNext,
  onPrevious,
  currentStep,
  
}) => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const handleSubmit = () => {
    // Handle final submission logic here
    console.log("Form submitted successfully!");
    if (onNext) {
      onNext();
    }
  };

  return (
    <div className="  px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto py-4 md:py-auto sm:py-24">
        <div className="text-center">
          {/* Main Heading */}
          <div className="mb-12 sm:mb-16">
            <h1 className="text-3xl sm:text-4xl font-semibold text-gray-900 mb-4 sm:mb-6">
              Ready to Submit?
            </h1>
            
            {/* Description Text */}
            <div className="text-gray-600 text-base sm:text-lg leading-relaxed">
              {/* Mobile: Paragraph format */}
              <p className="sm:hidden px-2">
                Your Medical Examiner profile is ready for review. Please confirm that all information and documents are accurate. Once submitted, our team will begin verification process.
              </p>
              {/* Desktop: Line format */}
              <div className="hidden sm:block space-y-2">
                <p>Your Medical Examiner profile is ready for review. Please</p>
                <p>confirm that all information and documents are accurate.</p>
                <p>Once submitted, our team will begin the verification process.</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div 
            className="flex justify-center items-center mt-8 sm:mt-0"
            style={{ gap: isMobile ? "20px" : "150px" }}
          >
            {/* Back Button */}
            <div className="flex-shrink-0">
              <BackButton
                onClick={onPrevious}
                disabled={currentStep === 1}
                borderColor="#00A8FF"
                iconColor="#00A8FF"
              />
            </div>
            
            {/* Submit Button */}
            <div className="flex-shrink-0">
              <ContinueButton
                onClick={handleSubmit}
                isLastStep={true}
                gradientFrom="#89D7FF"
                gradientTo="#00A8FF"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};