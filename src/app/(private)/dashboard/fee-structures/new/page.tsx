"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { DashboardShell } from "@/layouts/dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createFeeStructureAction } from "@/domains/fee-structures/actions";

export default function NewFeeStructurePage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const canSubmit = name.trim().length > 0;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFieldErrors({});

        try {
            const result = await createFeeStructureAction({
                name: name.trim(),
                description: description.trim() || undefined,
            });

            if (result.success) {
                toast.success("Fee structure created successfully");
                router.push(`/dashboard/fee-structures/${result.data.id}`);
            } else {
                const errorResult = result as {
                    success: false;
                    error: string;
                    fieldErrors?: Record<string, string>;
                };
                toast.error(errorResult.error || "Failed to create fee structure");
                if (errorResult.fieldErrors) {
                    setFieldErrors(errorResult.fieldErrors);
                }
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <DashboardShell>
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.push("/dashboard/fee-structures")}
                        className="rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <div>
                        <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight">
                            New Fee Structure
                        </h1>
                        <p className="text-sm text-[#7B8B91] font-poppins">
                            Create a draft rate card and then add variables.
                        </p>
                    </div>
                </div>

                <div className="bg-white rounded-[28px] shadow-sm p-6 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="font-poppins">
                                Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="name"
                                className="mt-0 rounded-[14px]"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Standard Examiner Rates 2025"
                                maxLength={255}
                                autoFocus
                            />
                            {fieldErrors.name && (
                                <p className="text-sm text-red-500 font-poppins">
                                    {fieldErrors.name}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description" className="font-poppins">
                                Description (optional)
                            </Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Short notes about when to use this fee structure"
                                rows={4}
                                className="rounded-[14px]"
                            />
                            {fieldErrors.description && (
                                <p className="text-sm text-red-500 font-poppins">
                                    {fieldErrors.description}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push("/dashboard/fee-structures")}
                                disabled={isSubmitting}
                                className="rounded-full"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={!canSubmit || isSubmitting}
                                className="rounded-full bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white hover:opacity-90"
                            >
                                {isSubmitting ? "Creating..." : "Create"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardShell>
    );
}


