// ── Error type detection ───────────────────────────────────────────────────────

export type DetectedErrorType =
  | "react"
  | "typescript"
  | "nextjs"
  | "cors"
  | "css"
  | "generic";

// ── Decoded output structure ───────────────────────────────────────────────────

export type SectionKey =
  | "explanation"
  | "location"
  | "rootCause"
  | "fix"
  | "prevention";

export interface DecodedSection {
  key: SectionKey;
  label: string;
  content: string;
  isComplete: boolean;
}

// ── Decode status ──────────────────────────────────────────────────────────────

export type DecodeStatus = "idle" | "loading" | "streaming" | "done" | "error";

// ── Share payload (URL-encoded) ────────────────────────────────────────────────

export interface SharePayload {
  trace: string;
  result?: DecodedSection[];
}

// ── Common errors gallery ──────────────────────────────────────────────────────

export interface CommonError {
  id: string;
  title: string;
  category: DetectedErrorType;
  rawTrace: string;
  decoded: DecodedSection[];
}
