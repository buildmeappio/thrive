import { checkUser } from "@/domains/user/server/handlers/checkUser";
import { api } from "@/lib/apiBuilder";
import toSafeAsync from "@/utils/toSafeAsync";

export const GET = api()
  .get(async (req) => {
    const result = await toSafeAsync(checkUser(req));
    if (!result.success) {
      return { success: false, error: result.error };
    }
    return { success: true, data: result.data };
  })
  .build();
