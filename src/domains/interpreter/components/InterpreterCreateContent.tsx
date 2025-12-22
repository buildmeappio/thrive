"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/layouts/dashboard";
import InterpreterForm from "./InterpreterForm";
import {
  createInterpreter,
  saveInterpreterAvailabilityAction,
} from "../actions";
import { toast } from "sonner";
import {
  InterpreterFormData,
  isErrorWithMessage,
} from "../types/interpreterForm.types";
import logger from "@/utils/logger";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function InterpreterCreateContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: InterpreterFormData) => {
    setIsLoading(true);
    try {
      const result = await createInterpreter({
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone || undefined,
        languageIds: data.languageIds,
      });

      if (!result.success) {
        const errorMessage =
          "message" in result && typeof result.message === "string"
            ? result.message
            : "Failed to create interpreter.";
        toast.error(errorMessage);
        return;
      }

      // Save availability after interpreter is created
      if (result.interpreter?.id) {
        await saveInterpreterAvailabilityAction({
          interpreterId: result.interpreter.id,
          weeklyHours: data.weeklyHours,
          overrideHours: data.overrideHours,
        });
      }

      toast.success("Interpreter added successfully!");
      router.push("/interpreter");
    } catch (error) {
      logger.error("Failed to create interpreter:", error);
      if (isErrorWithMessage(error) && error.message) {
        toast.error(error.message);
      } else {
        toast.error("Failed to create interpreter. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.push("/interpreter");
  };

  return (
    <DashboardShell>
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/interpreter"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </div>
        </Link>
        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight break-words">
          Add New{" "}
          <span className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] bg-clip-text text-transparent">
            Interpreter
          </span>
        </h1>
      </div>

      <div className="w-full flex flex-col items-center">
        <div className="bg-white rounded-2xl shadow px-4 sm:px-6 lg:px-12 py-6 sm:py-8 w-full">
          <InterpreterForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            submitLabel="Create Interpreter"
            isLoading={isLoading}
          />
        </div>
      </div>
    </DashboardShell>
  );
}
