// Small shared utilities.

/** Conditionally join class names (tiny clsx replacement). */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** Format an ISO timestamp for display (Malaysia Time, UTC+8), tolerant of null. */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-MY", {
    timeZone: "Asia/Kuala_Lumpur",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Human-readable duration between two timestamps. */
export function formatDuration(start: string, end: string | null): string {
  if (!end) return "Active";
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (Number.isNaN(ms) || ms < 0) return "—";
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
}

/** Parse the caller IP from proxy headers (Vercel sets x-forwarded-for). */
export function parseClientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return headers.get("x-real-ip");
}

/** Shorten a user-agent string to a friendly browser label. */
export function friendlyBrowser(ua: string | null | undefined): string {
  if (!ua) return "Unknown";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("OPR/") || ua.includes("Opera")) return "Opera";
  if (ua.includes("Chrome/")) return "Chrome";
  if (ua.includes("Firefox/")) return "Firefox";
  if (ua.includes("Safari/")) return "Safari";
  return "Other";
}

/**
 * True when an error means we never reached Supabase at all (DNS/socket
 * failure) rather than the backend rejecting the request. A paused Supabase
 * project stops resolving entirely, which surfaces as `fetch failed` /
 * ENOTFOUND — that must not be reported to the user as bad credentials.
 */
export function isBackendUnreachable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const err = error as {
    name?: string;
    message?: string;
    status?: number;
    cause?: unknown;
  };

  // supabase-js wraps network failures as AuthRetryableFetchError (status 0).
  if (err.name === "AuthRetryableFetchError") return true;
  if (err.message === "fetch failed") return true;

  const code = (err.cause as { code?: string } | undefined)?.code;
  return (
    code === "ENOTFOUND" ||
    code === "EAI_AGAIN" ||
    code === "ECONNREFUSED" ||
    code === "ETIMEDOUT"
  );
}
