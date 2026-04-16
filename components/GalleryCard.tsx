import Link from "next/link";
import { ERROR_TYPE_COLORS, ERROR_TYPE_LABELS } from "@/lib/detect-error-type";
import { encodeShareUrl } from "@/lib/share";
import type { CommonError } from "@/types";

interface GalleryCardProps {
  error: CommonError;
}

export function GalleryCard({ error }: GalleryCardProps) {
  // Build the link with both the trace and pre-decoded result encoded.
  // Clicking loads the decoder instantly with no API call required.
  const href = encodeShareUrl(error.rawTrace, error.decoded);

  // Show the first two lines of the raw trace as a preview
  const tracePreview = error.rawTrace.split("\n").slice(0, 2).join("\n");

  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 transition-colors hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
    >
      {/* Error title */}
      <p className="text-sm font-medium leading-snug text-[var(--color-text)] group-hover:text-white">
        {error.title}
      </p>

      {/* Trace preview */}
      <pre className="overflow-hidden rounded border border-[var(--color-border)] bg-[var(--color-base)] p-2 font-mono text-[0.7rem] leading-relaxed text-[var(--color-text-muted)] [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden">
        {tracePreview}
      </pre>

      {/* Category badge */}
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded border px-2 py-0.5 text-[0.65rem] font-medium ${ERROR_TYPE_COLORS[error.category]}`}
        >
          {ERROR_TYPE_LABELS[error.category]}
        </span>
        <span className="text-xs text-[var(--color-text-muted)] transition-colors group-hover:text-[var(--color-accent-hover)]">
          Load →
        </span>
      </div>
    </Link>
  );
}
