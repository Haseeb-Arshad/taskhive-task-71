import { EditorDraft, Post } from './types';

const POSTS_KEY = 'blog-portal-posts-v1';
const DRAFT_KEY = 'blog-portal-editor-draft-v1';

const seedPosts: Post[] = [
  {
    id: 'seed-1',
    title: 'How to Write Blog Content That Hooks Readers in 10 Seconds',
    content:
      'Great blog posts start with curiosity. The key is opening with tension, then giving a useful payoff. Blend storytelling with practical steps, and always guide readers toward a clear outcome. The most engaging posts are specific, human, and readable on mobile. Use short paragraphs, strategic headings, and one memorable line every few sections to keep momentum high.',
    metaDescription:
      'Learn practical techniques to write entertaining yet professional blog posts that keep readers engaged from headline to conclusion.',
    excerpt:
      'Great blog posts start with curiosity. The key is opening with tension, then giving a useful payoff...',
    category: 'Writing',
    tags: ['blogging', 'content strategy', 'engagement'],
    status: 'published',
    scheduledFor: null,
    seoScore: 84,
    authorRole: 'editor',
    views: 1200,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString()
  },
  {
    id: 'seed-2',
    title: 'The Ultimate Editorial Workflow for Fast-Growing Content Teams',
    content:
      'If your content team is scaling, your process must be clear. Use role-based responsibilities, structured briefs, and standardized review checklists. Writers should focus on ideation and drafting. Editors should own clarity, consistency, and publication readiness. Admins should monitor output quality with analytics and enforce standards.',
    metaDescription:
      'Build a high-performance editorial workflow with clear roles for writers, editors, and admins in your content portal.',
    excerpt:
      'If your content team is scaling, your process must be clear. Use role-based responsibilities...',
    category: 'Operations',
    tags: ['editorial', 'workflow', 'team'],
    status: 'scheduled',
    scheduledFor: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    seoScore: 76,
    authorRole: 'admin',
    views: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 40).toISOString()
  }
];

function safeParse<T>(value: string | null, fallback: T): T {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function loadPosts(): Post[] {
  if (typeof window === 'undefined') return seedPosts;

  const existing = safeParse<Post[]>(window.localStorage.getItem(POSTS_KEY), []);
  if (existing.length > 0) return existing;

  window.localStorage.setItem(POSTS_KEY, JSON.stringify(seedPosts));
  return seedPosts;
}

export function savePosts(posts: Post[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
}

export function loadDraft(): EditorDraft | null {
  if (typeof window === 'undefined') return null;
  return safeParse<EditorDraft | null>(window.localStorage.getItem(DRAFT_KEY), null);
}

export function saveDraft(draft: EditorDraft): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearDraft(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(DRAFT_KEY);
}
