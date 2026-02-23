import {
  LucideIcon,
  Gauge,
  FolderOpen,
  Shield,
  Briefcase,
  Stethoscope,
  Award,
  Languages,
  Building2,
  UserCog,
} from "lucide-react";

export type TaxonomyConfig = {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  description?: string;
};

// Define all taxonomy navigation items
export const TAXONOMIES: TaxonomyConfig[] = [
  {
    id: "case-statuses",
    label: "Case Statuses",
    icon: Gauge,
    href: "/dashboard/taxonomy/case-statuses",
    description: "Manage case status types",
  },
  {
    id: "case-types",
    label: "Case Types",
    icon: FolderOpen,
    href: "/dashboard/taxonomy/case-types",
    description: "Manage case types",
  },
  {
    id: "claim-types",
    label: "Claim Types",
    icon: Shield,
    href: "/dashboard/taxonomy/claim-types",
    description: "Manage claim types",
  },
  {
    id: "departments",
    label: "Departments",
    icon: Briefcase,
    href: "/dashboard/taxonomy/departments",
    description: "Manage departments",
  },
  {
    id: "examination-types",
    label: "Examination Types",
    icon: Stethoscope,
    href: "/dashboard/taxonomy/examination-types",
    description: "Manage examination types",
  },
  {
    id: "examination-type-benefits",
    label: "Examination Type Benefits",
    icon: Award,
    href: "/dashboard/taxonomy/examination-type-benefits",
    description: "Manage examination type benefits",
  },
  {
    id: "languages",
    label: "Languages",
    icon: Languages,
    href: "/dashboard/taxonomy/languages",
    description: "Manage language options",
  },
  {
    id: "organization-types",
    label: "Organization Types",
    icon: Building2,
    href: "/dashboard/taxonomy/organization-types",
    description: "Manage organization types",
  },
  {
    id: "roles",
    label: "Roles",
    icon: UserCog,
    href: "/dashboard/taxonomy/roles",
    description: "Manage user roles",
  },
];

// Helper function to get taxonomy by id
export const getTaxonomyById = (id: string): TaxonomyConfig | undefined => {
  return TAXONOMIES.find((taxonomy) => taxonomy.id === id);
};

// Helper function to check if a path matches a taxonomy
export const getTaxonomyByPath = (
  pathname: string,
): TaxonomyConfig | undefined => {
  return TAXONOMIES.find((taxonomy) => pathname.startsWith(taxonomy.href));
};
