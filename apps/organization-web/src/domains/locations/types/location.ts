import { AddressFormData } from '@/components/AddressForm';

export interface LocationFormData {
  name: string;
  address: AddressFormData;
  timezone: string;
  regionTag?: string;
  costCenterCode?: string;
  isActive: boolean;
}

export interface CreateLocationPayload {
  name: string;
  addressJson: AddressFormData;
  timezone: string;
  regionTag?: string;
  costCenterCode?: string;
  isActive?: boolean;
}

export interface UpdateLocationPayload {
  locationId: string;
  name?: string;
  addressJson?: AddressFormData;
  timezone?: string;
  regionTag?: string;
  costCenterCode?: string;
  isActive?: boolean;
}
