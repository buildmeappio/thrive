import type { ColumnDef, Table as ReactTable } from '@tanstack/react-table';
import type { InterviewData } from './InterviewData';
import type { Column } from '@tanstack/react-table';

/**
 * Filter state for interview table
 */
export interface FilterState {
  status: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

/**
 * Options for useInterviewTable hook
 */
export interface UseInterviewTableOptions {
  data: InterviewData[];
  searchQuery: string;
  filters?: FilterState;
}

/**
 * Column metadata for table columns
 */
export interface ColumnMeta {
  minSize?: number;
  maxSize?: number;
  size?: number;
}

/**
 * Props for SortableHeader component
 */
export interface SortableHeaderProps {
  column: Column<InterviewData, unknown>;
  children: React.ReactNode;
}

/**
 * Props for ActionButton component
 */
export interface ActionButtonProps {
  applicationId?: string;
}

/**
 * Return type for useInterviewTable hook
 */
export interface UseInterviewTableReturn {
  table: ReactTable<InterviewData>;
  columns: ColumnDef<InterviewData, unknown>[];
}

/**
 * Props for InterviewTable component
 */
export interface InterviewTableProps {
  table: UseInterviewTableReturn['table'];
  columns: UseInterviewTableReturn['columns'];
}
