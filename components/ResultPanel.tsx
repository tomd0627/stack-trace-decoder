"use client";

import { AlertCircle, Terminal } from "lucide-react";
import { StreamingSection } from "@/components/StreamingSection";
import { ShareButton } from "@/components/ShareButton";
import type { DecodedSection, DecodeStatus } from "@/types";

interface ResultPanelProps {
  sections: DecodedSection[];
  status: DecodeStatus;
  errorMessage: string | null;
  trace: string;
}

export function ResultPanel({
  sections,
  status,
  errorMessage,
  trace,
}: ResultPanelProps) {
  return (
    <div className="flex h-full flex-col">
      {/* Panel header */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          Decoded Output
        </h2>
        {status === "done" && sections.length > 0 && (
          <ShareButton trace={trace} sections={sections} />
        )}
      </div>

      {/* Content area */}
      <div
        className="flex-1"
        aria-live="polite"
        aria-label="Decoded output"
        aria-busy={status === "loading" || status === "streaming"}
      >
        {/* Idle state */}
        {status === "idle" && (
          <IdleState />
        )}

        {/* Loading state — waiting for first chunk */}
        {status === "loading" && sections.length === 0 && (
          <LoadingState />
        )}

        {/* Error state */}
        {status === "error" && (
          <ErrorState message={errorMessage} />
        )}

        {/* Streaming or done — show sections as they arrive */}
        {(status === "streaming" || status === "done" || status === "loading") &&
          sections.length > 0 && (
            <div className="flex flex-col gap-3">
              {sections.map((section) => (
                <StreamingSection key={section.key} section={section} />
              ))}
            </div>
          )}
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function IdleState() {
  return (
    <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-[var(--color-border)] text-center">
      <Terminal
        className="mb-3 h-8 w-8 text-[var(--color-text-muted)]"
        aria-hidden="true"
        strokeWidth={1.25}
      />
      <p className="text-sm text-[var(--color-text-muted)]">
        Paste an error above and click{" "}
        <span className="font-medium text-[var(--color-text-secondary)]">
          Decode
        </span>{" "}
        to get started
      </p>
      <p className="mt-1 text-xs text-[var(--color-text-muted)]">
        Or load one from the Common Errors gallery below
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col gap-3" aria-label="Loading…">
      {[180, 120, 200, 240, 100].map((width, i) => (
        <div
          key={i}
          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4"
        >
          <div className="mb-3 flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-[var(--color-border)] animate-pulse" />
            <div className="h-3 w-24 rounded bg-[var(--color-border)] animate-pulse" />
          </div>
          <div className="space-y-2">
            <div
              className="h-3 rounded bg-[var(--color-border)] animate-pulse"
              style={{ width: `${width}px`, maxWidth: "100%" }}
            />
            <div className="h-3 w-4/5 rounded bg-[var(--color-border)] animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string | null }) {
  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-[var(--color-error)] bg-[var(--color-error-light)] p-4">
      <div className="flex items-center gap-2">
        <AlertCircle
          className="h-4 w-4 shrink-0 text-[var(--color-error)]"
          aria-hidden="true"
        />
        <h3 className="text-sm font-semibold text-[var(--color-error)]">
          Decoding failed
        </h3>
      </div>
      <p className="text-sm text-[var(--color-text-secondary)]">
        {message ?? "Something went wrong. Please try again."}
      </p>
    </div>
  );
}
