"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import { encodeShareUrl } from "@/lib/share";
import type { DecodedSection } from "@/types";

interface ShareButtonProps {
  trace: string;
  sections: DecodedSection[];
}

export function ShareButton({ trace, sections }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    const url = encodeShareUrl(trace, sections, window.location.origin);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API not available (e.g., non-HTTPS in some browsers)
      // Fall back to selecting the URL from a temporary input
      const input = document.createElement("input");
      input.value = url;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={copied ? "Link copied to clipboard" : "Copy shareable link"}
      className="flex items-center gap-1.5 rounded-md border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent)]"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-[var(--color-success)]" aria-hidden="true" />
          <span className="text-[var(--color-success)]">Copied!</span>
        </>
      ) : (
        <>
          <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
          Share
        </>
      )}
    </button>
  );
}
