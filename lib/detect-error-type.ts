import type { DetectedErrorType } from "@/types";

/**
 * Pure function — classifies a raw stack trace string into a known error type.
 * Rules are evaluated in priority order; the first match wins.
 */
export function detectErrorType(trace: string): DetectedErrorType {
  if (!trace.trim()) return "generic";

  const rules: Array<[DetectedErrorType, RegExp]> = [
    [
      "react",
      /Cannot read properties.*undefined.*reading 'use'|at React\.|ReactDOM|react-dom|Minified React error|Warning: Each child|Warning: Can't perform|Warning: React Hook|Error: Hydration failed|Maximum update depth|at renderWithHooks|at mountIndeterminateComponent/i,
    ],
    [
      "typescript",
      /TS\d{3,4}:|Type '.*' is not assignable|Property '.*' does not exist on type|Object is possibly 'null'|Object is possibly 'undefined'|Argument of type '.*' is not assignable|Parameter '.*' implicitly has an 'any' type/,
    ],
    [
      "nextjs",
      /NEXT_NOT_FOUND|at Object\.render \(.*\.next|next\/dist|Error: Hydration failed|getServerSideProps is not|getStaticProps is not|Module not found.*@\/|next build|\.next\/server/i,
    ],
    [
      "cors",
      /Access-Control-Allow-Origin|has been blocked by CORS policy|Cross-Origin Request Blocked|CORB|response to preflight|preflight request/i,
    ],
    [
      "css",
      /specificity|Unexpected token.*CSS|Unknown property|SyntaxError.*stylesheet|@media.*invalid/i,
    ],
  ];

  for (const [type, pattern] of rules) {
    if (pattern.test(trace)) return type;
  }

  return "generic";
}

/**
 * Loose smell-check — returns false only when the input clearly isn't an error.
 * Intentionally permissive: single-line errors, CORS messages, TS codes, etc.
 * all pass. Only random short text or obvious non-errors fail.
 */
export function looksLikeError(trace: string): boolean {
  const t = trace.trim();
  if (t.length < 15) return false;

  return [
    /\bat\s+\w/,                                        // stack frame: "at foo"
    /\b(Type|Syntax|Reference|Range|URI|Eval)Error\b/i,
    /\berror:/i,
    /\bexception:/i,
    /TS\d{3,4}:/,                                       // TypeScript error code
    /\.(js|ts|tsx|jsx|mjs|cjs):\d+/,                   // file:line reference
    /cannot read prop/i,
    /is not (defined|a function|assignable)/i,
    /CORS|Access-Control/i,
    /hydration failed/i,
    /module not found/i,
    /\bwarning:/i,
    /failed to (fetch|load)/i,
    /\buncaught\b/i,
    /object is possibly/i,
    /unexpected token/i,
  ].some((p) => p.test(t));
}

export const ERROR_TYPE_LABELS: Record<DetectedErrorType, string> = {
  react: "React",
  typescript: "TypeScript",
  nextjs: "Next.js",
  cors: "CORS",
  css: "CSS",
  generic: "JavaScript",
};

export const ERROR_TYPE_COLORS: Record<DetectedErrorType, string> = {
  react: "text-sky-300 bg-sky-950 border-sky-800",
  typescript: "text-blue-300 bg-blue-950 border-blue-800",
  nextjs: "text-slate-200 bg-slate-800 border-slate-600",
  cors: "text-orange-300 bg-orange-950 border-orange-800",
  css: "text-purple-300 bg-purple-950 border-purple-800",
  generic: "text-slate-300 bg-slate-800 border-slate-600",
};
