import React, { useState } from "react";
import { Label } from "~/components/ui/label";
import ContinueButton from "~/components/ui/ContinueButton";
import BackButton from "~/components/ui/BackButton";
import { PasswordInput } from "~/components/ui/PasswordInput";

interface Step9PasswordProps {
  userId?: string;
  onNext: () => void;
  onPrevious: () => void;
  currentStep: number;
  totalSteps: number;
}

export const Step9Password: React.FC<Step9PasswordProps> = ({
  userId,
  onNext,
  onPrevious,
  currentStep,
  totalSteps,
}) => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<string[]>([]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };
  const handleSubmit = () => {
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="my-10 text-3xl font-medium text-[#140047]">
          Create Your Password
        </h3>
      </div>

      <div className="mt-8 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password" className="text-black">
            Password<span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="pr-12"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-black">
            Confirm Password<span className="text-red-500">*</span>
          </Label>
          <div className="relative">
            <PasswordInput
              id="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) =>
                handleInputChange("confirmPassword", e.target.value)
              }
              className="pr-12"
            />
          </div>
        </div>
      </div>

      <div className="mt-auto flex justify-end pt-8">
        <ContinueButton
          onClick={handleSubmit}
          gradientFrom="#89D7FF"
          gradientTo="#00A8FF"
        />
      </div>
    </div>
  );
};
