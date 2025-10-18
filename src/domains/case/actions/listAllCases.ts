import { getCurrentUser } from "@/domains/auth/server/session";
import handlers from "../server/handlers";
import { Roles } from "@/domains/auth/constants/roles";

const listAllCases = async () => {

  const user = await getCurrentUser();

  let assignToUserId: string | undefined;

  if (user?.roleName !== Roles.SUPER_ADMIN) {
    assignToUserId = user?.accountId;
  }

  const cases = await handlers.listCases(assignToUserId);

  return cases;
};

export default listAllCases;
