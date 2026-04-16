import { BookOpen } from "lucide-react";
import { COMMON_ERRORS } from "@/lib/common-errors";
import { GalleryCard } from "@/components/GalleryCard";
import { ERROR_TYPE_LABELS } from "@/lib/detect-error-type";
import type { DetectedErrorType } from "@/types";

// Group errors by category for display
function groupByCategory(
  errors: typeof COMMON_ERRORS
): Map<DetectedErrorType, typeof COMMON_ERRORS> {
  const map = new Map<DetectedErrorType, typeof COMMON_ERRORS>();
  const order: DetectedErrorType[] = [
    "react",
    "typescript",
    "nextjs",
    "cors",
  ];

  for (const type of order) {
    const group = errors.filter((e) => e.category === type);
    if (group.length > 0) map.set(type, group);
  }

  // Any remaining categories
  for (const error of errors) {
    if (!order.includes(error.category)) {
      const existing = map.get(error.category) ?? [];
      map.set(error.category, [...existing, error]);
    }
  }

  return map;
}

export function GallerySection() {
  const grouped = groupByCategory(COMMON_ERRORS);

  return (
    <div>
      {/* Section heading */}
      <div className="mb-6 flex items-center gap-2">
        <BookOpen
          className="h-4 w-4 text-[var(--color-text-muted)]"
          aria-hidden="true"
          strokeWidth={1.5}
        />
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Common Errors
        </h2>
        <span className="ml-1 text-xs text-[var(--color-text-muted)]">
          — click any card to load a pre-decoded example
        </span>
      </div>

      {/* Groups */}
      <div className="flex flex-col gap-8">
        {Array.from(grouped.entries()).map(([category, errors]) => (
          <div key={category}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
              {ERROR_TYPE_LABELS[category]} Errors
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {errors.map((error) => (
                <GalleryCard key={error.id} error={error} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
