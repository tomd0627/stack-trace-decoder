"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { TraceInput } from "@/components/TraceInput";
import { ResultPanel } from "@/components/ResultPanel";
import { detectErrorType } from "@/lib/detect-error-type";
import type {
  DecodeStatus,
  DecodedSection,
  DetectedErrorType,
  SectionKey,
} from "@/types";

// ── Section header mapping ─────────────────────────────────────────────────────

const HEADER_TO_KEY: Record<string, SectionKey> = {
  EXPLANATION: "explanation",
  LOCATION: "location",
  ROOT_CAUSE: "rootCause",
  FIX: "fix",
  PREVENTION: "prevention",
};

const KEY_TO_LABEL: Record<SectionKey, string> = {
  explanation: "What happened",
  location: "Where it happened",
  rootCause: "Root cause",
  fix: "How to fix it",
  prevention: "How to prevent this",
};

// ── Stream buffer parser ───────────────────────────────────────────────────────

/**
 * Parse an accumulated stream buffer into structured sections.
 * Finds `## SECTION_NAME` headers at the start of lines and splits on them.
 */
function parseBuffer(
  buffer: string,
  forceComplete = false
): DecodedSection[] {
  const headerRegex = /^## (EXPLANATION|LOCATION|ROOT_CAUSE|FIX|PREVENTION)\s*$/gm;
  const sections: DecodedSection[] = [];
  const matches = [...buffer.matchAll(headerRegex)];

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const key = HEADER_TO_KEY[match[1]];
    if (!key) continue;

    const contentStart = match.index! + match[0].length;
    const contentEnd = matches[i + 1]?.index ?? buffer.length;
    const content = buffer.slice(contentStart, contentEnd).trim();

    sections.push({
      key,
      label: KEY_TO_LABEL[key],
      content,
      isComplete: forceComplete || i < matches.length - 1,
    });
  }

  return sections;
}

// ── Component ──────────────────────────────────────────────────────────────────

interface DecoderShellProps {
  initialTrace?: string;
  initialResult?: DecodedSection[];
}

export function DecoderShell({
  initialTrace,
  initialResult,
}: DecoderShellProps) {
  const [sections, setSections] = useState<DecodedSection[]>(
    initialResult ?? []
  );
  const [status, setStatus] = useState<DecodeStatus>(
    initialResult ? "done" : "idle"
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentTrace, setCurrentTrace] = useState(initialTrace ?? "");

  const bufferRef = useRef<string>("");

  const handleDecode = useCallback(
    async (trace: string, errorType: DetectedErrorType) => {
      bufferRef.current = "";
      setSections([]);
      setErrorMessage(null);
      setStatus("loading");
      setCurrentTrace(trace);

      try {
        const response = await fetch("/api/decode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ trace, errorType }),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          throw new Error(
            (errorBody as { error?: string }).error ??
              `Request failed with status ${response.status}.`
          );
        }

        if (!response.body) {
          throw new Error("No response body received.");
        }

        setStatus("streaming");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });

          if (chunk.includes("[DECODE_ERROR]")) {
            throw new Error(
              "Decoding failed partway through. Please try again."
            );
          }

          bufferRef.current += chunk;
          setSections(parseBuffer(bufferRef.current));
        }

        // Final parse — mark all sections as complete
        setSections(parseBuffer(bufferRef.current, true));
        setStatus("done");
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Something went wrong."
        );
        setStatus("error");
      }
    },
    []
  );

  // Auto-decode when arriving from a share URL that has a trace but no cached result
  useEffect(() => {
    if (initialTrace && !initialResult) {
      void handleDecode(initialTrace, detectErrorType(initialTrace));
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 md:items-start">
      {/* Left panel — input */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <TraceInput
          initialTrace={initialTrace}
          status={status}
          onDecode={handleDecode}
        />
      </div>

      {/* Right panel — output */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <ResultPanel
          sections={sections}
          status={status}
          errorMessage={errorMessage}
          trace={currentTrace}
        />
      </div>
    </div>
  );
}
