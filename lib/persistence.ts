import type { BlogPost, EditorDraft, Role } from "./blog";

const POSTS_KEY = "blog_portal_posts_v1";
const DRAFT_KEY = "blog_portal_editor_draft_v1";
const ROLE_KEY = "blog_portal_role_v1";

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function loadPosts(): BlogPost[] {
  if (typeof window === "undefined") return [];
  return safeParse<BlogPost[]>(window.localStorage.getItem(POSTS_KEY), []);
}

export function savePosts(posts: BlogPost[]): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function loadDraft(): EditorDraft | null {
  if (typeof window === "undefined") return null;
  return safeParse<EditorDraft | null>(window.localStorage.getItem(DRAFT_KEY), null);
}

export function saveDraft(draft: EditorDraft): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(DRAFT_KEY);
}

export function loadRole(): Role {
  if (typeof window === "undefined") return "writer";
  const role = window.localStorage.getItem(ROLE_KEY);
  if (role === "writer" || role === "editor" || role === "admin") return role;
  return "writer";
}

export function saveRole(role: Role): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ROLE_KEY, role);
}
