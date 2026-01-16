"use server";

import { getCurrentUser } from "@/domains/auth/server/session";
import handlers from "../server/handlers";
import { redirect } from "next/navigation";
import type {
  CreateOrganizationInput,
  CreateOrganizationResult,
} from "../types/CreateOrganization.types";

const createOrganization = async (
  data: CreateOrganizationInput,
): Promise<CreateOrganizationResult> => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const result = await handlers.createOrganization(data);
  return result;
};

export default createOrganization;
