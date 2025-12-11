import { checkUser } from "@/domains/user/server/handlers/checkUser";
import { api } from "@/lib/apiBuilder";
import toSafeAsync from "@/utils/toSafeAsync";

// Mark route as dynamic to prevent static analysis during build
export const dynamic = 'force-dynamic';

export const GET = api().get(async (req) => {
  const result = await toSafeAsync(checkUser(req));
  if (!result.success) {
		return { success: false, error: result.error };
  }
  return { success: true, data: result.data };
}).build();
