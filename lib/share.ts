import type { DecodedSection, SharePayload } from "@/types";

const MAX_TRACE_LENGTH = 8000;

/** Encode a string to base64url (URL-safe, no padding, UTF-8 safe). */
function toBase64Url(str: string): string {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Decode a base64url string back to a UTF-8 string. */
function fromBase64Url(str: string): string {
  const padded = str + "==".slice((str.length % 4) || 4);
  return decodeURIComponent(
    escape(atob(padded.replace(/-/g, "+").replace(/_/g, "/")))
  );
}

/**
 * Build a shareable URL encoding both the trace and (optionally) the decoded result.
 * When `result` is included, opening the link skips the API call entirely.
 */
export function encodeShareUrl(
  trace: string,
  result?: DecodedSection[],
  baseUrl = ""
): string {
  const params = new URLSearchParams();
  params.set("t", toBase64Url(trace.slice(0, MAX_TRACE_LENGTH)));

  if (result && result.length > 0) {
    params.set("r", toBase64Url(JSON.stringify(result)));
  }

  return `${baseUrl}/?${params.toString()}`;
}

/**
 * Decode a share URL's searchParams back into a SharePayload.
 * Returns null if the `t` param is missing or malformed.
 */
export function decodeShareUrl(
  searchParams: URLSearchParams
): SharePayload | null {
  const t = searchParams.get("t");
  if (!t) return null;

  try {
    const trace = fromBase64Url(t);
    const r = searchParams.get("r");
    const result = r
      ? (JSON.parse(fromBase64Url(r)) as DecodedSection[])
      : undefined;

    return { trace, result };
  } catch {
    return null;
  }
}
