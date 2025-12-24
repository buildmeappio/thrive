"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { FeeStructureStatus } from "@prisma/client";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import LabeledSelect from "@/components/ui/LabeledSelect";

import FeeStructuresTable from "./FeeStructuresTable";
import type { FeeStructureListItem } from "../types/feeStructure.types";

type Props = {
    feeStructures: FeeStructureListItem[];
    initialStatus: "ALL" | FeeStructureStatus;
    initialSearch: string;
};

const statusOptions = [
    { label: "All", value: "ALL" },
    { label: "Draft", value: "DRAFT" },
    { label: "Active", value: "ACTIVE" },
    { label: "Archived", value: "ARCHIVED" },
] as const;

function buildQuery(params: Record<string, string | undefined>) {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
        if (v && v.trim() !== "" && v !== "ALL") q.set(k, v);
    });
    const s = q.toString();
    return s ? `?${s}` : "";
}

export default function FeeStructuresPageContent({
    feeStructures,
    initialStatus,
    initialSearch,
}: Props) {
    const router = useRouter();
    const [status, setStatus] = useState<string>(initialStatus ?? "ALL");
    const [search, setSearch] = useState(initialSearch ?? "");

    const resultCount = feeStructures.length;

    const queryString = useMemo(() => {
        return buildQuery({ status, search });
    }, [status, search]);

    // Debounced URL updates for search
    useEffect(() => {
        const t = setTimeout(() => {
            router.push(`/dashboard/fee-structures${queryString}`);
        }, 250);
        return () => clearTimeout(t);
    }, [queryString, router]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-[#000000] text-[20px] sm:text-[28px] lg:text-[36px] font-semibold font-degular leading-tight">
                        Fee Structures
                    </h1>
                    <p className="text-sm text-[#7B8B91] font-poppins">
                        Rate cards used by templates as{" "}
                        <code className="bg-[#EEF1F3] px-1.5 py-0.5 rounded">
                            {"{{fees.<key>}}"}
                        </code>
                    </p>
                </div>

                <Button
                    onClick={() => router.push("/dashboard/fee-structures/new")}
                    className="bg-gradient-to-r from-[#00A8FF] to-[#01F4C8] text-white rounded-full px-4 py-2 hover:opacity-90 transition-opacity font-semibold"
                >
                    <Plus className="w-4 h-4" />
                    New
                </Button>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row lg:items-end gap-4">
                <div className="flex-1">
                    <label className="flex flex-col">
                        <span className="mb-1 ml-2 text-[12px] font-medium text-[#676767] font-poppins">
                            Search
                        </span>
                        <Input
                            icon={Search}
                            iconPosition="left"
                            className="mt-0 rounded-full bg-white border border-[#E5E7EB]"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by name…"
                        />
                    </label>
                </div>

                <LabeledSelect
                    label="Status"
                    value={status}
                    onChange={(v) => setStatus(v)}
                    options={statusOptions.map((o) => ({ label: o.label, value: o.value }))}
                    className="w-full lg:w-[220px]"
                />

                <div className="text-sm text-[#676767] font-poppins lg:pb-1">
                    {resultCount} result{resultCount !== 1 ? "s" : ""}
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-[28px] shadow-sm px-4 py-4 w-full">
                <FeeStructuresTable feeStructures={feeStructures} />
            </div>
        </div>
    );
}


