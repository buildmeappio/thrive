import { OrganizationType } from "@prisma/client";

export class OrganizationDto {
  static toOrganization(data: any) {
    return {
      id: data.id,
      name: data.name,
      website: data.website,
      status: data.status,
      type: data.type,
      address: data.address,
      manager: data.manager,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      // Add other fields as needed
    };
  }

  static toOrganizationTypes(data: OrganizationType){
    return {
      id: data.id,
      name: data.name,
    }
  }
}