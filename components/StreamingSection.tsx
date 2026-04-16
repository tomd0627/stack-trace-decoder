"use client";

import {
  AlertTriangle,
  FileCode,
  Lightbulb,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import type { DecodedSection, SectionKey } from "@/types";

// ── Section metadata ───────────────────────────────────────────────────────────

const SECTION_META: Record<
  SectionKey,
  {
    icon: React.ComponentType<{ className?: string }>;
    accentClass: string;
    bgClass: string;
    borderClass: string;
    labelClass: string;
  }
> = {
  explanation: {
    icon: Lightbulb,
    accentClass: "text-[var(--color-text-secondary)]",
    bgClass: "bg-[var(--color-surface-2)]",
    borderClass: "border-[var(--color-border)]",
    labelClass: "text-[var(--color-text-secondary)]",
  },
  location: {
    icon: MapPin,
    accentClass: "text-[var(--color-accent-hover)]",
    bgClass: "bg-[var(--color-accent-light)]",
    borderClass: "border-[var(--color-accent)]",
    labelClass: "text-[var(--color-accent-hover)]",
  },
  rootCause: {
    icon: AlertTriangle,
    accentClass: "text-[var(--color-warning)]",
    bgClass: "bg-[var(--color-warning-light)]",
    borderClass: "border-[var(--color-warning)]",
    labelClass: "text-[var(--color-warning)]",
  },
  fix: {
    icon: FileCode,
    accentClass: "text-[var(--color-success)]",
    bgClass: "bg-[var(--color-success-light)]",
    borderClass: "border-[var(--color-success)]",
    labelClass: "text-[var(--color-success)]",
  },
  prevention: {
    icon: ShieldCheck,
    accentClass: "text-[var(--color-accent-hover)]",
    bgClass: "bg-[var(--color-accent-light)]",
    borderClass: "border-[var(--color-accent)]",
    labelClass: "text-[var(--color-accent-hover)]",
  },
};

// ── Markdown-lite renderer ─────────────────────────────────────────────────────
// Handles the subset of markdown Claude produces: fenced code blocks,
// inline code, numbered lists, bullet lists, and bold text.

function renderContent(content: string, isStreaming: boolean): React.ReactNode {
  if (!content) return null;

  const segments: React.ReactNode[] = [];
  let remaining = content;
  let key = 0;

  while (remaining.length > 0) {
    // Fenced code block
    const codeBlockMatch = remaining.match(/^```(\w*)\n([\s\S]*?)(?:```|$)/);
    if (codeBlockMatch) {
      const lang = codeBlockMatch[1] || "text";
      const code = codeBlockMatch[2];
      const isClosed = remaining.startsWith("```" + lang + "\n" + code + "```");
      segments.push(
        <pre
          key={key++}
          className="prose-dark my-3 overflow-x-auto rounded-md border border-[var(--color-border)] bg-[var(--color-base)] p-4 font-mono text-[0.8125rem] leading-relaxed text-[var(--color-text)]"
        >
          <code>
            {code}
            {!isClosed && isStreaming && (
              <span className="streaming-cursor" aria-hidden="true" />
            )}
          </code>
        </pre>
      );
      remaining = isClosed
        ? remaining.slice(("```" + lang + "\n" + code + "```").length)
        : "";
      continue;
    }

    // Process line by line for other markdown elements
    const newlineIdx = remaining.indexOf("\n");
    const line =
      newlineIdx === -1 ? remaining : remaining.slice(0, newlineIdx);
    remaining = newlineIdx === -1 ? "" : remaining.slice(newlineIdx + 1);

    if (line === "") {
      segments.push(<br key={key++} />);
      continue;
    }

    // Numbered list item
    const numberedMatch = line.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      segments.push(
        <div key={key++} className="flex gap-2 py-0.5">
          <span className="shrink-0 font-mono text-sm text-[var(--color-text-muted)]">
            {numberedMatch[1]}.
          </span>
          <span className="text-sm leading-relaxed text-[var(--color-text)]">
            {renderInline(numberedMatch[2])}
          </span>
        </div>
      );
      continue;
    }

    // Bullet list item
    const bulletMatch = line.match(/^[-*•]\s+(.+)/);
    if (bulletMatch) {
      segments.push(
        <div key={key++} className="flex gap-2 py-0.5">
          <span
            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-text-muted)]"
            aria-hidden="true"
          />
          <span className="text-sm leading-relaxed text-[var(--color-text)]">
            {renderInline(bulletMatch[1])}
          </span>
        </div>
      );
      continue;
    }

    // Regular paragraph line
    segments.push(
      <p key={key++} className="text-sm leading-relaxed text-[var(--color-text)]">
        {renderInline(line)}
      </p>
    );
  }

  return <>{segments}</>;
}

/** Render inline markdown: `code`, **bold** */
function renderInline(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={i}
          className="rounded border border-[var(--color-border)] bg-[var(--color-surface-2)] px-1 py-0.5 font-mono text-[0.8125em] text-[var(--color-accent-hover)]"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-[var(--color-text)]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

// ── Component ──────────────────────────────────────────────────────────────────

interface StreamingSectionProps {
  section: DecodedSection;
}

export function StreamingSection({ section }: StreamingSectionProps) {
  const meta = SECTION_META[section.key];
  const Icon = meta.icon;
  const isStreaming = !section.isComplete;

  return (
    <section
      className={`section-enter rounded-lg border ${meta.bgClass} ${meta.borderClass} p-4`}
      aria-label={section.label}
    >
      {/* Section header */}
      <div className="mb-3 flex items-center gap-2">
        <Icon className={`h-4 w-4 shrink-0 ${meta.accentClass}`} aria-hidden="true" />
        <h3 className={`text-xs font-semibold uppercase tracking-wider ${meta.labelClass}`}>
          {section.label}
        </h3>
      </div>

      {/* Content */}
      <div>
        {section.content ? (
          renderContent(section.content, isStreaming)
        ) : (
          // Still waiting for first characters
          <span className="streaming-cursor" aria-hidden="true" />
        )}
        {/* Streaming cursor appended after complete content */}
        {isStreaming && section.content && !section.content.includes("```") && (
          <span className="streaming-cursor" aria-hidden="true" />
        )}
      </div>
    </section>
  );
}
