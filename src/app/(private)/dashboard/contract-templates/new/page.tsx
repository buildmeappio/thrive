"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/layouts/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createContractTemplateAction } from "@/domains/contract-templates/actions";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NewContractTemplatePage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  // Auto-generate slug from display name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
      .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
  };

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    // Only auto-update slug if it hasn't been manually edited
    if (!slugManuallyEdited) {
      setSlug(generateSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlug(value);
    setSlugManuallyEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await createContractTemplateAction({
        slug,
        displayName,
      });

      if (result.success) {
        toast.success("Contract template created successfully");
        router.push(`/dashboard/contract-templates/${result.data.id}`);
      } else {
        toast.error(
          "error" in result
            ? result.error
            : "Failed to create contract template",
        );
      }
    } catch (error) {
      console.error("Error creating contract template:", error);
      toast.error("Failed to create contract template");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/dashboard/contract-templates"
            className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 transition-opacity shadow-sm hover:shadow-md"
          >
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4" />
          </Link>
          <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight">
            New Contract Template
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-[28px] border border-[#E9EDEE] bg-white p-6 space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="displayName"
                className="font-poppins font-semibold"
              >
                Display Name *
              </Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => handleDisplayNameChange(e.target.value)}
                placeholder="e.g., IME Examiner Agreement"
                className="rounded-[14px] font-poppins"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="font-poppins font-semibold">
                Slug *
              </Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) =>
                  handleSlugChange(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                  )
                }
                placeholder="e.g., ime-examiner-agreement"
                className="rounded-[14px] font-poppins"
                required
              />
              <p className="text-xs text-gray-500 font-poppins">
                Lowercase letters, numbers, and hyphens only. Auto-generated
                from display name.
              </p>
            </div>
          </div>

          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/contract-templates")}
              className="rounded-full font-poppins"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !slug || !displayName}
              className="rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90 font-poppins"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Template"
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardShell>
  );
}
