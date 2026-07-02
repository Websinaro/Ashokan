import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import { getSessionFromCookies } from "@/lib/auth";

// Returns the Mongoose user document for the current session, or null.
export async function requireUser() {
  const session = getSessionFromCookies();
  if (!session) return null;

  await connectDB();
  const user = await User.findById(session.userId);
  return user || null;
}
