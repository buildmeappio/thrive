export interface ServiceArea {
  province: string;
  address: string;
}

export interface TransporterData {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  serviceAreas: ServiceArea[];
  status: "ACTIVE" | "SUSPENDED";
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateTransporterData {
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  serviceAreas: ServiceArea[];
}

export interface UpdateTransporterData {
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  serviceAreas?: ServiceArea[];
  status?: "ACTIVE" | "SUSPENDED";
}

export const TRANSPORTER_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
] as const;
