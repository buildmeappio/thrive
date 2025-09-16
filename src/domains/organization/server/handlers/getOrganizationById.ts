import { getCurrentUser } from "@/domains/auth/server/session";
import organizationsService from "../organizations.service";
import { redirect } from "next/navigation";

export default async function getOrganizationById(id: string) {
  return organizationsService.getOrganizationById(id);
}
