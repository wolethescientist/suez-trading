import "server-only";
import crypto from "node:crypto";

const BASE = "https://api.paystack.co";

function secretKey() {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) throw new Error("PAYSTACK_SECRET_KEY is not set in the environment.");
  return key;
}

export function paystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

type InitArgs = {
  email: string;
  /** Amount in kobo. */
  amount: number;
  reference: string;
  callbackUrl: string;
  currency?: string;
  metadata?: Record<string, unknown>;
  channels?: string[];
};

export type PaystackInitResult = {
  authorization_url: string;
  access_code: string;
  reference: string;
};

async function paystackFetch<T>(
  path: string,
  init?: RequestInit,
): Promise<{ status: boolean; message: string; data: T }> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${secretKey()}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const body = (await res.json().catch(() => null)) as {
    status: boolean;
    message: string;
    data: T;
  } | null;

  if (!body) throw new Error(`Paystack returned a non-JSON response (${res.status}).`);
  if (!res.ok || !body.status) {
    throw new Error(body.message || `Paystack request failed (${res.status}).`);
  }
  return body;
}

export async function initializeTransaction(args: InitArgs) {
  const body = await paystackFetch<PaystackInitResult>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: args.email,
      amount: args.amount,
      reference: args.reference,
      currency: args.currency ?? "NGN",
      callback_url: args.callbackUrl,
      metadata: args.metadata,
      ...(args.channels ? { channels: args.channels } : {}),
    }),
  });
  return body.data;
}

export type PaystackTransaction = {
  id: number;
  status: string; // "success" | "failed" | "abandoned"
  reference: string;
  amount: number;
  currency: string;
  paid_at: string | null;
  channel: string | null;
  gateway_response: string | null;
  customer: { email: string };
  metadata?: Record<string, unknown>;
};

export async function verifyTransaction(reference: string) {
  const body = await paystackFetch<PaystackTransaction>(
    `/transaction/verify/${encodeURIComponent(reference)}`,
  );
  return body.data;
}

/**
 * Paystack signs webhooks with HMAC SHA512 over the raw body using the secret
 * key. Compared in constant time — a plain `===` here would leak the digest.
 */
export function isValidWebhookSignature(rawBody: string, signature: string | null) {
  if (!signature) return false;
  const expected = crypto
    .createHmac("sha512", secretKey())
    .update(rawBody, "utf8")
    .digest("hex");
  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
