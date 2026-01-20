export type SuperAdminSectionProps = {
  organizationId: string;
  onSuperAdminChange?: (hasSuperAdmin: boolean) => void;
  refreshKey?: number;
  onRemoveClick?: () => void;
  isRemoving?: boolean;
};
