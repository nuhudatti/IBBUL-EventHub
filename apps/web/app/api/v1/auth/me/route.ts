import { auth } from "@/lib/auth";
import { fail, ok } from "@/lib/utils/api-response";

export async function GET(): Promise<Response> {
  const session = await auth();
  if (!session?.user) {
    return fail("UNAUTHORIZED", "Authentication required.", undefined, 401);
  }

  return ok(session.user);
}
