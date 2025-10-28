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
  vehicleTypes: string[];
  fleetInfo?: string;
  baseAddress: string;
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
  vehicleTypes: string[];
  fleetInfo?: string;
  baseAddress: string;
}

export interface UpdateTransporterData {
  companyName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  serviceAreas?: ServiceArea[];
  vehicleTypes?: string[];
  fleetInfo?: string;
  baseAddress?: string;
  status?: "ACTIVE" | "SUSPENDED";
}

export const VEHICLE_TYPES = [
  { value: "cars", label: "Cars" },
  { value: "vans", label: "Vans" },
  { value: "wheelchair-accessible", label: "Wheelchair Accessible" },
] as const;

export const TRANSPORTER_STATUSES = [
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
] as const;
