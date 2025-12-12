import { getCurrentUser } from "@/domains/auth/server/session";
import handlers from "../server/handlers";
import { redirect } from "next/navigation";
import { cache } from "react";

const getReportById = cache(async (id: string) => {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const reportDetails = await handlers.getReportById(id);
  return reportDetails;
});

export default getReportById;
