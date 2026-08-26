import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { can, CAN } from "@/lib/constants";

const COOKIE = "suez_admin_session";
const MAX_AGE = 60 * 60 * 8; // 8 hours

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 24) {
    throw new Error(
      "AUTH_SECRET is missing or too short. Set a 32+ character random string in .env",
    );
  }
  return new TextEncoder().encode(s);
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: string;
};

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .setSubject(user.id)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE);
}

/** Reads the cookie only — cheap, used for rendering. Returns null when signed out. */
export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: String(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
      role: String(payload.role),
    };
  } catch {
    return null;
  }
}

/**
 * Session + a database check that the account is still active. Every admin
 * page and mutation goes through this, so deactivating a staff account takes
 * effect immediately rather than when their token expires.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const user = await prisma.adminUser.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, role: true, active: true },
  });

  // Next forbids mutating cookies from a Server Component, so the stale cookie
  // is cleared by the /admin/logout route handler rather than here.
  if (!user) redirect("/admin/logout?reason=expired");
  if (!user.active) redirect("/admin/logout?reason=inactive");

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function requirePermission(action: keyof typeof CAN) {
  const user = await requireAdmin();
  if (!can(user.role, action)) {
    throw new Error("You do not have permission to perform this action.");
  }
  return user;
}

export async function login(email: string, password: string) {
  const user = await prisma.adminUser.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  // Always run a compare so a missing account and a wrong password take the
  // same amount of time.
  const hash = user?.passwordHash ?? "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
  const ok = await verifyPassword(password, hash);

  if (!user || !ok) return { ok: false as const, error: "Invalid email or password." };
  if (!user.active) return { ok: false as const, error: "This account has been deactivated." };

  await prisma.adminUser.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });
  await createSession({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });
  return { ok: true as const };
}
