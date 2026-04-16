import { decodeShareUrl } from "@/lib/share";
import { DecoderShell } from "@/components/DecoderShell";
import { GallerySection } from "@/components/GallerySection";

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  // Resolve string params for the share decoder
  const urlParams = new URLSearchParams(
    Object.entries(params).flatMap(([k, v]) =>
      Array.isArray(v) ? v.map((val) => [k, val]) : v ? [[k, v]] : []
    )
  );

  const shared = decodeShareUrl(urlParams);

  return (
    <main className="min-h-dvh flex flex-col">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            {/* Terminal icon */}
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)]"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <rect
                  x="1"
                  y="3"
                  width="18"
                  height="14"
                  rx="2.5"
                  stroke="var(--color-accent)"
                  strokeWidth="1.5"
                />
                <path
                  d="M5 8l3 2-3 2"
                  stroke="var(--color-accent)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M11 12h4"
                  stroke="var(--color-accent)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <h1 className="text-base font-semibold leading-none text-[var(--color-text)]">
                Stack Trace Decoder
              </h1>
              <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
                Paste any browser error — get a plain-English explanation and
                exact fix
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ── Decoder ─────────────────────────────────────────────────────── */}
      <section
        className="flex-1"
        aria-label="Error decoder"
      >
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <DecoderShell
            key={urlParams.get("t") ?? "default"}
            initialTrace={shared?.trace}
            initialResult={shared?.result}
          />
        </div>
      </section>

      {/* ── Gallery ─────────────────────────────────────────────────────── */}
      <section
        className="border-t border-[var(--color-border)]"
        aria-label="Common errors gallery"
      >
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <GallerySection />
        </div>
      </section>
    </main>
  );
}
