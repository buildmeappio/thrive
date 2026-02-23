import { getCurrentUser } from "@/domains/auth/server/session";
import handlers from "../server/handlers";
import { redirect } from "next/navigation";

const listAllCases = async () => {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const cases = await handlers.listCases();

  return cases;
};

export default listAllCases;
