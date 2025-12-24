"use client";

import { useState, useEffect } from "react";
import { FeeVariableType } from "@prisma/client";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { FeeVariableData } from "../types/feeStructure.types";

type FeeVariableDialogProps = {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: {
        label: string;
        key: string;
        type: FeeVariableType;
        defaultValue?: unknown;
        required: boolean;
        currency?: string;
        decimals?: number;
        unit?: string;
    }) => Promise<{ success: boolean; fieldErrors?: Record<string, string> }>;
    initialData?: FeeVariableData | null;
    isLoading?: boolean;
};

const toSnakeCase = (str: string): string => {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .replace(/^[0-9_]+/, "")
        .replace(/_+$/, "");
};

const variableTypes: { value: FeeVariableType; label: string }[] = [
    { value: "MONEY", label: "Money" },
    { value: "NUMBER", label: "Number" },
    { value: "TEXT", label: "Text" },
    { value: "BOOLEAN", label: "Boolean" },
];

export default function FeeVariableDialog({
    open,
    onClose,
    onSubmit,
    initialData,
    isLoading = false,
}: FeeVariableDialogProps) {
    const [label, setLabel] = useState("");
    const [key, setKey] = useState("");
    const [type, setType] = useState<FeeVariableType>("MONEY");
    const [defaultValue, setDefaultValue] = useState<string>("");
    const [defaultBoolValue, setDefaultBoolValue] = useState(false);
    const [required, setRequired] = useState(false);
    const [currency, setCurrency] = useState("USD");
    const [decimals, setDecimals] = useState<string>("2");
    const [unit, setUnit] = useState("");
    const [keyEdited, setKeyEdited] = useState(false);
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const isEditing = !!initialData;

    // Reset form when dialog opens/closes or initialData changes
    useEffect(() => {
        if (open) {
            if (initialData) {
                setLabel(initialData.label);
                setKey(initialData.key);
                setType(initialData.type);
                setRequired(initialData.required);
                setCurrency(initialData.currency || "USD");
                setDecimals(initialData.decimals?.toString() || "2");
                setUnit(initialData.unit || "");
                setKeyEdited(true);

                // Set default value based on type
                if (initialData.type === "BOOLEAN") {
                    setDefaultBoolValue(initialData.defaultValue === true);
                    setDefaultValue("");
                } else if (initialData.defaultValue !== null && initialData.defaultValue !== undefined) {
                    setDefaultValue(String(initialData.defaultValue));
                    setDefaultBoolValue(false);
                } else {
                    setDefaultValue("");
                    setDefaultBoolValue(false);
                }
            } else {
                // Reset for new variable
                setLabel("");
                setKey("");
                setType("MONEY");
                setDefaultValue("");
                setDefaultBoolValue(false);
                setRequired(false);
                setCurrency("USD");
                setDecimals("2");
                setUnit("");
                setKeyEdited(false);
            }
            setFieldErrors({});
        }
    }, [open, initialData]);

    // Auto-generate key from label if not manually edited
    useEffect(() => {
        if (!keyEdited && label) {
            setKey(toSnakeCase(label));
        }
    }, [label, keyEdited]);

    // Reset decimals when type changes
    useEffect(() => {
        if (type === "MONEY") {
            setDecimals("2");
        } else if (type === "NUMBER") {
            setDecimals("0");
        }
    }, [type]);

    const handleSubmit = async () => {
        setFieldErrors({});

        // Prepare default value based on type
        let finalDefaultValue: unknown = undefined;
        if (type === "BOOLEAN") {
            finalDefaultValue = defaultBoolValue;
        } else if (defaultValue.trim() !== "") {
            if (type === "MONEY" || type === "NUMBER") {
                finalDefaultValue = parseFloat(defaultValue);
            } else {
                finalDefaultValue = defaultValue;
            }
        }

        const result = await onSubmit({
            label: label.trim(),
            key: key.trim(),
            type,
            defaultValue: finalDefaultValue,
            required,
            currency: type === "MONEY" ? currency : undefined,
            decimals:
                type === "MONEY" || type === "NUMBER" ? parseInt(decimals, 10) : undefined,
            unit: unit.trim() || undefined,
        });

        if (!result.success && result.fieldErrors) {
            setFieldErrors(result.fieldErrors);
        }
    };

    const handleClose = () => {
        setFieldErrors({});
        onClose();
    };

    const canSubmit =
        label.trim() !== "" &&
        key.trim() !== "" &&
        /^[a-z][a-z0-9_]*$/.test(key.trim());

    return (
        <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>
                        {isEditing ? "Edit Variable" : "Add Variable"}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    {/* Label */}
                    <div className="grid gap-2">
                        <Label htmlFor="label">
                            Label <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="e.g., Base Examination Fee"
                            maxLength={80}
                        />
                        {fieldErrors.label && (
                            <p className="text-sm text-red-500">{fieldErrors.label}</p>
                        )}
                    </div>

                    {/* Key */}
                    <div className="grid gap-2">
                        <Label htmlFor="key">
                            Variable Key <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="key"
                            value={key}
                            onChange={(e) => {
                                setKey(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                                setKeyEdited(true);
                            }}
                            placeholder="e.g., base_exam_fee"
                            maxLength={64}
                        />
                        <p className="text-xs text-muted-foreground">
                            Used as <code className="bg-muted px-1 py-0.5 rounded">{"{{fees." + (key || "key") + "}}"}</code>
                        </p>
                        {fieldErrors.key && (
                            <p className="text-sm text-red-500">{fieldErrors.key}</p>
                        )}
                    </div>

                    {/* Type */}
                    <div className="grid gap-2">
                        <Label htmlFor="type">
                            Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            value={type}
                            onValueChange={(v) => setType(v as FeeVariableType)}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {variableTypes.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>
                                        {t.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {fieldErrors.type && (
                            <p className="text-sm text-red-500">{fieldErrors.type}</p>
                        )}
                    </div>

                    {/* Default Value */}
                    <div className="grid gap-2">
                        <Label htmlFor="defaultValue">
                            Default Value {required && <span className="text-red-500">*</span>}
                        </Label>
                        {type === "BOOLEAN" ? (
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="defaultBoolValue"
                                    checked={defaultBoolValue}
                                    onCheckedChange={(checked) =>
                                        setDefaultBoolValue(checked === true)
                                    }
                                />
                                <label
                                    htmlFor="defaultBoolValue"
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    {defaultBoolValue ? "Yes (True)" : "No (False)"}
                                </label>
                            </div>
                        ) : (
                            <Input
                                id="defaultValue"
                                type={type === "MONEY" || type === "NUMBER" ? "number" : "text"}
                                step={type === "MONEY" ? "0.01" : type === "NUMBER" ? "any" : undefined}
                                value={defaultValue}
                                onChange={(e) => setDefaultValue(e.target.value)}
                                placeholder={
                                    type === "MONEY"
                                        ? "e.g., 150.00"
                                        : type === "NUMBER"
                                            ? "e.g., 10"
                                            : "Enter default text"
                                }
                            />
                        )}
                        {fieldErrors.defaultValue && (
                            <p className="text-sm text-red-500">{fieldErrors.defaultValue}</p>
                        )}
                    </div>

                    {/* Required */}
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="required"
                            checked={required}
                            onCheckedChange={(checked) => setRequired(checked === true)}
                        />
                        <label
                            htmlFor="required"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                            Required (must have a default value)
                        </label>
                    </div>

                    {/* Currency (MONEY only) */}
                    {type === "MONEY" && (
                        <div className="grid gap-2">
                            <Label htmlFor="currency">Currency</Label>
                            <Input
                                id="currency"
                                value={currency}
                                onChange={(e) => setCurrency(e.target.value.toUpperCase())}
                                placeholder="USD"
                                maxLength={3}
                            />
                            {fieldErrors.currency && (
                                <p className="text-sm text-red-500">{fieldErrors.currency}</p>
                            )}
                        </div>
                    )}

                    {/* Decimals (MONEY or NUMBER) */}
                    {(type === "MONEY" || type === "NUMBER") && (
                        <div className="grid gap-2">
                            <Label htmlFor="decimals">Decimal Places</Label>
                            <Input
                                id="decimals"
                                type="number"
                                min="0"
                                max="6"
                                value={decimals}
                                onChange={(e) => setDecimals(e.target.value)}
                            />
                            {fieldErrors.decimals && (
                                <p className="text-sm text-red-500">{fieldErrors.decimals}</p>
                            )}
                        </div>
                    )}

                    {/* Unit */}
                    <div className="grid gap-2">
                        <Label htmlFor="unit">Unit (optional)</Label>
                        <Input
                            id="unit"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            placeholder="e.g., /hour, /mile, per page"
                            maxLength={20}
                        />
                        {fieldErrors.unit && (
                            <p className="text-sm text-red-500">{fieldErrors.unit}</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={!canSubmit || isLoading}>
                        {isLoading ? "Saving..." : isEditing ? "Update" : "Add"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

