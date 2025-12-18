import { getCurrentUser } from "@/domains/auth/server/session";
import handlers from "../server/handlers";
import { redirect } from "next/navigation";
import { cache } from "react";

const getOrganizationDetails = cache(async (number: string) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  const organizationDetails = await handlers.getOrganizationById(number);
  return organizationDetails;
});

export default getOrganizationDetails;
