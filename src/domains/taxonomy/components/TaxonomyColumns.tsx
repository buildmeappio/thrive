import { cn } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown, Edit, Trash2 } from "lucide-react";
import { TaxonomyData, TaxonomyType } from "../types/Taxonomy";
import { formatDate, formatTaxonomyName } from "@/utils/date";
import { convertUTCMinutesToLocal } from "@/utils/timezone";
import React, { useRef, useEffect, useState } from "react";

const Header = ({
  children,
  first,
  sortable,
  onClick,
  sortDirection,
}: {
  children: React.ReactNode;
  first?: boolean;
  sortable?: boolean;
  onClick?: () => void;
  sortDirection?: false | "asc" | "desc";
}) => {
  return (
    <div
      className={cn(
        "font-poppins flex items-center gap-2 text-left text-[16px] leading-5 font-semibold text-black",
        first && "",
        sortable &&
          "cursor-pointer transition-colors select-none hover:text-[#000093]"
      )}
      onClick={sortable ? onClick : undefined}>
      <span>{children}</span>
      {sortable && (
        <div className="flex items-center">
          {sortDirection === false && (
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
          )}
          {sortDirection === "asc" && (
            <ArrowUp className="h-4 w-4 text-[#000093]" />
          )}
          {sortDirection === "desc" && (
            <ArrowDown className="h-4 w-4 text-[#000093]" />
          )}
        </div>
      )}
    </div>
  );
};

const ActionButton = ({ onEdit }: { onEdit: () => void }) => {
  return (
    <button onClick={onEdit} className="cursor-pointer">
      <div className="flex h-[30px] w-[40px] items-center justify-center rounded-full bg-[#E0E0FF] p-0 hover:opacity-80">
        <Edit className="h-4 w-4 text-[#000093]" />
      </div>
    </button>
  );
};

const DeleteButton = ({
  onDelete,
  disabled = false,
  tooltip,
}: {
  onDelete: () => void;
  disabled?: boolean;
  tooltip?: string;
}) => {
  return (
    <div className="relative group">
      <button
        onClick={disabled ? undefined : onDelete}
        disabled={disabled}
        className={cn("cursor-pointer", disabled && "cursor-not-allowed")}>
        <div
          className={cn(
            "flex h-[30px] w-[40px] items-center justify-center rounded-full p-0 transition-opacity",
            disabled ? "bg-gray-100 opacity-50" : "bg-red-50 hover:opacity-80"
          )}>
          <Trash2
            className={cn(
              "h-4 w-4",
              disabled ? "text-gray-400" : "text-red-600"
            )}
          />
        </div>
      </button>
      {disabled && tooltip && (
        <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
          {tooltip}
          <div className="absolute top-full right-4 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const Content = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) => {
  const textRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const element = textRef.current;
    if (element) {
      // Check if text is truncated (scrollWidth > clientWidth means text is cut off)
      setShowTooltip(element.scrollWidth > element.clientWidth);
    }
  }, [children]);

  return (
    <div
      ref={textRef}
      className="text-[#4D4D4D] font-poppins text-[16px] leading-5 overflow-hidden text-ellipsis whitespace-nowrap"
      title={showTooltip ? title : undefined}>
      {children}
    </div>
  );
};

const formatFieldName = (fieldName: string): string => {
  // Convert camelCase to Title Case
  return fieldName
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
};

export const createTaxonomyColumns = (
  displayFields: string[],
  onEdit: (taxonomy: TaxonomyData) => void,
  onDelete: (taxonomy: TaxonomyData) => void,
  type: TaxonomyType
): ColumnDef<TaxonomyData>[] => {
  const columns: ColumnDef<TaxonomyData>[] = displayFields.map(
    (field, index) => ({
      header: ({ column }) => (
        <Header
          first={index === 0}
          sortable
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          sortDirection={column.getIsSorted()}>
          {formatFieldName(field)}
        </Header>
      ),
      accessorKey: field,
      cell: ({ row }) => {
        const value = row.original[field];
        const displayValue =
          value !== null && value !== undefined ? String(value) : "N/A";

        let formattedValue = displayValue;

        // Format name fields (like 'name', 'benefit', 'examinationTypeName')
        if (
          field === "name" ||
          field === "benefit" ||
          field.toLowerCase().includes("name")
        ) {
          formattedValue = formatTaxonomyName(displayValue);

          // For configuration, if name is "slot duration", append "(in minutes)"
          // If name is "booking cancellation time", append "(in hours)"
          if (type === "configuration" && field === "name") {
            const configName = formattedValue.toLowerCase();
            if (
              configName.includes("slot") &&
              configName.includes("duration")
            ) {
              formattedValue = `${formattedValue} (in minutes)`;
            } else if (
              configName.includes("booking") &&
              configName.includes("cancellation") &&
              configName.includes("time")
            ) {
              formattedValue = `${formattedValue} (in hours)`;
            } else if (
              configName.includes("booking") &&
              configName.includes("reservation") &&
              configName.includes("time")
            ) {
              formattedValue = `${formattedValue} (in seconds)`;
            }
          }
        }
        // Format value field for configuration as time if it's a time-related config
        else if (type === "configuration" && field === "value") {
          // Try to parse as number
          const numValue =
            typeof value === "number"
              ? value
              : typeof value === "string"
              ? parseInt(value, 10)
              : Number(value);

          // Check if it's a valid numeric value
          if (!isNaN(numValue) && typeof numValue === "number") {
            const configName = String(row.original.name || "").toLowerCase();

            // Check if it's "start working hour time" - format as time with UTC conversion
            // All other configurations (including new ones) will display as raw numbers
            const isStartWorkingHourTime =
              configName.includes("start") &&
              configName.includes("working") &&
              configName.includes("hour") &&
              configName.includes("time");

            if (isStartWorkingHourTime) {
              // Format "start working hour time" as time (e.g., 480 UTC -> "3:00 AM" local)
              // Convert UTC minutes to local time
              if (
                numValue >= 0 &&
                numValue < 1440 &&
                Number.isInteger(numValue)
              ) {
                formattedValue = convertUTCMinutesToLocal(numValue);
              } else {
                formattedValue = String(numValue);
              }
            } else {
              // For all other configurations (slot duration, booking cancellation time, total working hours, and new configs),
              // show as raw number without any time formatting
              formattedValue = String(numValue);
            }
          } else {
            // Not a valid number, show as-is
            formattedValue = String(value);
          }
        }

        return <Content title={formattedValue}>{formattedValue}</Content>;
      },
      size: field === "description" ? 250 : 200,
      maxSize: field === "description" ? 300 : 250,
    })
  );

  // Add Frequency column (appears in all taxonomy tables except configuration)
  if (type !== "configuration") {
    columns.push({
      header: ({ column }) => (
        <Header
          sortable
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          sortDirection={column.getIsSorted()}>
          Frequency
        </Header>
      ),
      accessorKey: "frequency",
      cell: ({ row }) => {
        const frequency = row.original.frequency ?? 0;
        return <Content title={frequency.toString()}>{frequency}</Content>;
      },
      sortingFn: (rowA, rowB) => {
        const freqA = rowA.original.frequency ?? 0;
        const freqB = rowB.original.frequency ?? 0;
        return freqA - freqB;
      },
      size: 120,
      maxSize: 150,
    });
  }

  // Add Date Added column
  columns.push({
    header: ({ column }) => (
      <Header
        sortable
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        sortDirection={column.getIsSorted()}>
        Date Added
      </Header>
    ),
    accessorKey: "createdAt",
    cell: ({ row }) => {
      const date = formatDate(row.original.createdAt);
      return <Content title={date}>{date}</Content>;
    },
    sortingFn: "datetime",
    size: 150,
    maxSize: 180,
  });

  // Add Actions column
  // For configuration: show both edit and delete buttons
  // For all other taxonomies: show only delete button (no edit)
  const isConfiguration = type === "configuration";
  const showEditButton = isConfiguration;
  const showDeleteButton = true; // Show delete button for all taxonomies including configuration

  columns.push({
    header: "",
    accessorKey: "id",
    cell: ({ row }) => {
      // Configuration items don't have frequency, so they can always be deleted
      const frequency = row.original.frequency ?? 0;
      const isDisabled = isConfiguration ? false : frequency > 0;
      const tooltip = isDisabled
        ? `This item has been assigned to ${frequency} ${
            frequency === 1 ? "person" : "people"
          }, so it cannot be deleted.`
        : undefined;

      return (
        <div className="flex justify-end items-center gap-2">
          {showEditButton && (
            <ActionButton onEdit={() => onEdit(row.original)} />
          )}
          {showDeleteButton && (
            <DeleteButton
              onDelete={() => onDelete(row.original)}
              disabled={isDisabled}
              tooltip={tooltip}
            />
          )}
        </div>
      );
    },
    size: isConfiguration ? 120 : 100,
    maxSize: isConfiguration ? 150 : 120,
    enableSorting: false,
  });

  return columns;
};
