"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, X } from "lucide-react";
import {
  detectErrorType,
  ERROR_TYPE_COLORS,
  ERROR_TYPE_LABELS,
  looksLikeError,
} from "@/lib/detect-error-type";
import type { DecodeStatus, DetectedErrorType } from "@/types";

const MAX_CHARS = 10_000;

interface TraceInputProps {
  initialTrace?: string;
  status: DecodeStatus;
  onDecode: (trace: string, errorType: DetectedErrorType) => void;
  onClear: () => void;
}

export function TraceInput({ initialTrace, status, onDecode, onClear }: TraceInputProps) {
  const [trace, setTrace] = useState(initialTrace ?? "");
  const [detectedType, setDetectedType] = useState<DetectedErrorType>("generic");
  const [showWarning, setShowWarning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isLoading = status === "loading" || status === "streaming";

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 400)}px`;
  }, []);

  // Detect error type on input with 300ms debounce
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value.slice(0, MAX_CHARS);
      setTrace(value);
      setShowWarning(false);
      autoResize();

      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setDetectedType(detectErrorType(value));
      }, 300);
    },
    [autoResize]
  );

  // Update detection when initial trace is set from share URL
  useEffect(() => {
    if (initialTrace) {
      setDetectedType(detectErrorType(initialTrace));
      autoResize();
    }
  }, [initialTrace, autoResize]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = trace.trim();
    if (!trimmed || isLoading) return;

    if (!showWarning && !looksLikeError(trimmed)) {
      setShowWarning(true);
      return;
    }

    setShowWarning(false);
    onDecode(trimmed, detectErrorType(trimmed));
  }

  function handleClear() {
    setTrace("");
    setDetectedType("generic");
    setShowWarning(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
    onClear();
  }

  const charCount = trace.length;
  const isNearLimit = charCount > MAX_CHARS * 0.85;
  const isAtLimit = charCount >= MAX_CHARS;

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col gap-3">
      {/* Panel header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
          Paste Error
        </h2>
        {trace && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear input"
            className="flex items-center gap-1 rounded px-2 py-1 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
          >
            <X className="h-3 w-3" aria-hidden="true" />
            Clear
          </button>
        )}
      </div>

      {/* Textarea */}
      <div className="relative flex-1">
        <label htmlFor="trace-input" className="sr-only">
          Stack trace or error message
        </label>
        <textarea
          id="trace-input"
          ref={textareaRef}
          value={trace}
          onChange={handleChange}
          placeholder={`Paste your error here…\n\nExamples:\n  TypeError: Cannot read properties of undefined\n  TS2322: Type 'string' is not assignable to type 'number'\n  Access to fetch has been blocked by CORS policy`}
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
          disabled={isLoading}
          aria-describedby="char-count"
          className="w-full min-h-[220px] resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 font-mono text-sm leading-relaxed text-[var(--color-text)] placeholder-[var(--color-text-muted)] outline-none transition-colors focus:border-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-60"
          style={{ fontFamily: "var(--font-mono)" }}
        />
      </div>

      {/* Validation warning */}
      {showWarning && (
        <p className="text-xs text-[var(--color-warning)]" role="alert">
          This doesn&apos;t look like a stack trace. Click Decode again to try anyway.
        </p>
      )}

      {/* Footer row — detected type badge + char count + decode button */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* Detected error type badge */}
          {trace.trim() && (
            <span
              className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${ERROR_TYPE_COLORS[detectedType]}`}
              aria-label={`Detected error type: ${ERROR_TYPE_LABELS[detectedType]}`}
            >
              {ERROR_TYPE_LABELS[detectedType]}
            </span>
          )}

          {/* Character count */}
          {trace && (
            <span
              id="char-count"
              className={`text-xs tabular-nums ${
                isAtLimit
                  ? "text-[var(--color-error)]"
                  : isNearLimit
                    ? "text-[var(--color-warning)]"
                    : "text-[var(--color-text-muted)]"
              }`}
              aria-live="polite"
            >
              {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
            </span>
          )}
        </div>

        {/* Decode button */}
        <button
          type="submit"
          disabled={!trace.trim() || isLoading}
          aria-label={isLoading ? "Decoding…" : "Decode error"}
          className="flex items-center gap-2 rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Decoding…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Decode
            </>
          )}
        </button>
      </div>
    </form>
  );
}
