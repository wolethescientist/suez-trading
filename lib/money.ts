/** All money in this app is stored as integer kobo to avoid float drift. */
export function formatNaira(kobo: number, opts?: { decimals?: boolean }) {
  const naira = kobo / 100;
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: opts?.decimals ? 2 : naira % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(naira);
}

export function nairaToKobo(naira: number | string) {
  const n = typeof naira === "string" ? parseFloat(naira) : naira;
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

export function koboToNaira(kobo: number) {
  return kobo / 100;
}
