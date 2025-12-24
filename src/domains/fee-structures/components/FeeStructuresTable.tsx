"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FeeStructureStatus } from "@prisma/client";
import { Copy, Archive, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import StatusBadge from "./StatusBadge";
import { FeeStructureListItem } from "../types/feeStructure.types";
import {
    duplicateFeeStructureAction,
    archiveFeeStructureAction,
} from "../actions";

type FeeStructuresTableProps = {
    feeStructures: FeeStructureListItem[];
};

const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
};

export default function FeeStructuresTable({
    feeStructures,
}: FeeStructuresTableProps) {
    const router = useRouter();
    const [archiveDialogOpen, setArchiveDialogOpen] = useState(false);
    const [structureToArchive, setStructureToArchive] =
        useState<FeeStructureListItem | null>(null);
    const [isArchiving, setIsArchiving] = useState(false);
    const [isDuplicating, setIsDuplicating] = useState<string | null>(null);

    const handleRowClick = (id: string) => {
        router.push(`/dashboard/fee-structures/${id}`);
    };

    const handleDuplicate = async (
        e: React.MouseEvent,
        feeStructure: FeeStructureListItem
    ) => {
        e.stopPropagation();
        setIsDuplicating(feeStructure.id);

        try {
            const result = await duplicateFeeStructureAction(feeStructure.id);

            if (result.success) {
                toast.success("Fee structure duplicated successfully");
                router.push(`/dashboard/fee-structures/${result.data.id}`);
            } else {
                const errorResult = result as { success: false; error: string };
                toast.error(errorResult.error || "Failed to duplicate fee structure");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsDuplicating(null);
        }
    };

    const handleArchiveClick = (
        e: React.MouseEvent,
        feeStructure: FeeStructureListItem
    ) => {
        e.stopPropagation();
        setStructureToArchive(feeStructure);
        setArchiveDialogOpen(true);
    };

    const handleArchive = async () => {
        if (!structureToArchive) return;

        setIsArchiving(true);

        try {
            const result = await archiveFeeStructureAction(structureToArchive.id);

            if (result.success) {
                toast.success("Fee structure archived successfully");
                router.refresh();
            } else {
                const errorResult = result as { success: false; error: string };
                toast.error(errorResult.error || "Failed to archive fee structure");
            }
        } catch {
            toast.error("An error occurred");
        } finally {
            setIsArchiving(false);
            setArchiveDialogOpen(false);
            setStructureToArchive(null);
        }
    };

    return (
        <div className="dashboard-zoom-mobile">
            {feeStructures.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-[28px] border border-gray-200">
                    <p className="text-[#7B8B91] font-poppins text-[16px]">
                        No fee structures found
                    </p>
                    <p className="text-[#A3ADB3] font-poppins text-[13px] mt-1">
                        Try adjusting filters or create a new fee structure.
                    </p>
                </div>
            ) : (
                <div className="rounded-md outline-none max-h-[70vh] lg:max-h-none overflow-x-auto md:overflow-x-visible">
                    <Table className="w-full border-0 table-fixed">
                        <TableHeader>
                            <TableRow className="bg-[#F3F3F3] border-b-0">
                                <TableHead className="px-6 py-2 text-left text-base font-medium text-black whitespace-nowrap overflow-hidden rounded-l-2xl">
                                    Name
                                </TableHead>
                                <TableHead className="px-6 py-2 text-left text-base font-medium text-black whitespace-nowrap overflow-hidden">
                                    Status
                                </TableHead>
                                <TableHead className="px-6 py-2 text-center text-base font-medium text-black whitespace-nowrap overflow-hidden">
                                    # Variables
                                </TableHead>
                                <TableHead className="px-6 py-2 text-left text-base font-medium text-black whitespace-nowrap overflow-hidden">
                                    Last Updated
                                </TableHead>
                                <TableHead className="px-6 py-2 text-right text-base font-medium text-black whitespace-nowrap overflow-hidden rounded-r-2xl">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {feeStructures.map((feeStructure) => (
                                <TableRow
                                    key={feeStructure.id}
                                    onClick={() => handleRowClick(feeStructure.id)}
                                    className="bg-white border-0 border-b-1 cursor-pointer"
                                >
                                    <TableCell className="px-6 py-3 overflow-hidden align-middle">
                                        <div
                                            className="text-[#4D4D4D] font-poppins text-[16px] leading-normal truncate"
                                            title={feeStructure.name}
                                        >
                                            {feeStructure.name}
                                        </div>
                                    </TableCell>
                                    <TableCell className="px-6 py-3 overflow-hidden align-middle">
                                        <StatusBadge status={feeStructure.status} />
                                    </TableCell>
                                    <TableCell className="px-6 py-3 overflow-hidden align-middle text-center">
                                        <span className="text-[#4D4D4D] font-poppins text-[16px] leading-normal">
                                            {feeStructure.variableCount}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-3 overflow-hidden align-middle">
                                        <span className="text-[#4D4D4D] font-poppins text-[16px] leading-normal">
                                            {formatDate(feeStructure.updatedAt)}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-6 py-3 overflow-hidden align-middle text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRowClick(feeStructure.id);
                                                    }}
                                                >
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={(e) => handleDuplicate(e, feeStructure)}
                                                    disabled={isDuplicating === feeStructure.id}
                                                >
                                                    <Copy className="w-4 h-4 mr-2" />
                                                    {isDuplicating === feeStructure.id
                                                        ? "Duplicating..."
                                                        : "Duplicate"}
                                                </DropdownMenuItem>
                                                {feeStructure.status !== FeeStructureStatus.ARCHIVED && (
                                                    <DropdownMenuItem
                                                        onClick={(e) =>
                                                            handleArchiveClick(e, feeStructure)
                                                        }
                                                        className="text-red-600"
                                                    >
                                                        <Archive className="w-4 h-4 mr-2" />
                                                        Archive
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Archive Confirmation Dialog */}
            <AlertDialog open={archiveDialogOpen} onOpenChange={setArchiveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Archive Fee Structure</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to archive{" "}
                            <strong>{structureToArchive?.name}</strong>? Archived fee
                            structures cannot be edited.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isArchiving}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleArchive}
                            disabled={isArchiving}
                            className="bg-gray-600 hover:bg-gray-700"
                        >
                            {isArchiving ? "Archiving..." : "Archive"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
