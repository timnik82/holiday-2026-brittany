import type { PageFrontmatter } from "@/lib/content/schemas";

export const CONTENT_STATUS_LABELS: Record<
  PageFrontmatter["status"],
  string
> = {
  draft: "Draft",
  review: "In review",
  published: "Published",
};
