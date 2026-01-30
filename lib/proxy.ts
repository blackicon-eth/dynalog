import { getAuthCookie } from "./auth/cookies";
import { verifyToken, type TokenPayload } from "./auth/jwt";

export async function getAuthenticatedUser(): Promise<TokenPayload | null> {
  const token = await getAuthCookie();

  if (!token) {
    return null;
  }

  const payload = await verifyToken(token);
  return payload;
}

export async function requireAuth(): Promise<TokenPayload> {
  const user = await getAuthenticatedUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
