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
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}
