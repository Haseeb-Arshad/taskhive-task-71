export type Role = "writer" | "editor" | "admin";
export type PostStatus = "draft" | "scheduled" | "published";

export interface PostAnalytics {
  views: number;
  likes: number;
  readTimeMinutes: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tags: string[];
  status: PostStatus;
  seoKeyword: string;
  metaDescription: string;
  seoScore: number;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  analytics: PostAnalytics;
}

export interface EditorDraft {
  id: string | null;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  tagsInput: string;
  seoKeyword: string;
  metaDescription: string;
  scheduledAt: string;
}

export const CATEGORIES = [
  "Technology",
  "Productivity",
  "AI & Future",
  "Culture",
  "Startups",
  "Lifestyle",
  "Design",
];

export function createSlug(title: string): string {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return base || `post-${Date.now()}`;
}

export function stripMarkdown(input: string): string {
  return input
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/\n+/g, " ")
    .trim();
}

export function estimateReadTime(content: string): number {
  const words = stripMarkdown(content)
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

export function parseTags(tagsInput: string): string[] {
  return tagsInput
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 10);
}

export function calculateSeoScore(data: {
  title: string;
  content: string;
  seoKeyword: string;
  metaDescription: string;
  tags: string[];
}): { score: number; checks: string[] } {
  const checks: string[] = [];
  let points = 0;

  const titleLength = data.title.trim().length;
  if (titleLength >= 30 && titleLength <= 65) {
    points += 20;
    checks.push("Title length is in the ideal SEO range (30-65 chars).");
  } else {
    checks.push("Adjust title length to 30-65 characters.");
  }

  const metaLength = data.metaDescription.trim().length;
  if (metaLength >= 70 && metaLength <= 160) {
    points += 20;
    checks.push("Meta description has a healthy length.");
  } else {
    checks.push("Meta description should be 70-160 characters.");
  }

  const cleanContent = stripMarkdown(data.content);
  const wordCount = cleanContent.split(/\s+/).filter(Boolean).length;
  if (wordCount >= 250) {
    points += 20;
    checks.push("Content depth is solid (250+ words).");
  } else {
    checks.push("Increase content depth to at least 250 words.");
  }

  if (data.seoKeyword && cleanContent.toLowerCase().includes(data.seoKeyword.toLowerCase())) {
    points += 20;
    checks.push("Primary keyword appears in content.");
  } else {
    checks.push("Use your primary keyword naturally in the post body.");
  }

  if (data.tags.length >= 2) {
    points += 10;
    checks.push("Good topical coverage using tags.");
  } else {
    checks.push("Use at least two tags for discoverability.");
  }

  if (data.title && data.seoKeyword && data.title.toLowerCase().includes(data.seoKeyword.toLowerCase())) {
    points += 10;
    checks.push("Primary keyword is present in title.");
  } else {
    checks.push("Include keyword in title when natural.");
  }

  return { score: Math.max(0, Math.min(100, points)), checks };
}
