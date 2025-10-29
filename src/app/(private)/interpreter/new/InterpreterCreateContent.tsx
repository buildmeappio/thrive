"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/layouts/dashboard";
import InterpreterForm from "@/domains/interpreter/components/InterpreterForm";
import { createInterpreter } from "@/domains/interpreter/actions";
import { toast } from "sonner";

type FormData = {
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  languageIds: string[];
};

export default function InterpreterCreateContent() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await createInterpreter({
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone || undefined,
        languageIds: data.languageIds,
      });
      
      toast.success("Interpreter added successfully!");
      router.push("/interpreter");
    } catch (error) {
      console.error("Failed to create interpreter:", error);
      toast.error("Failed to create interpreter. Please try again.");
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
      <div className="mb-6">
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

