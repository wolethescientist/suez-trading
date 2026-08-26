import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Clears the admin session cookie and returns to the sign-in page.
 *
 * This exists as a route handler because Next only permits cookie mutation
 * inside Server Actions and Route Handlers — `requireAdmin` runs inside Server
 * Components, so it redirects here instead of deleting the cookie itself.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const reason = url.searchParams.get("reason");

  await destroySession();

  const target = new URL("/admin/login", process.env.NEXT_PUBLIC_SITE_URL ?? url.origin);
  if (reason) target.searchParams.set("error", reason);
  return NextResponse.redirect(target);
}
