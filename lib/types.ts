export type Role = 'writer' | 'editor' | 'admin';

export type PostStatus = 'draft' | 'published' | 'scheduled' | 'archived';

export interface Post {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  metaDescription: string;
  category: string;
  tags: string[];
  status: PostStatus;
  author: string;
  createdAt: string;
  updatedAt: string;
  scheduledFor?: string;
  seoScore: number;
  views: number;
  readingTime: number;
}

export interface EditorDraft {
  title: string;
  content: string;
  metaDescription: string;
  category: string;
  tagsInput: string;
  scheduledFor: string;
}

export interface SeoAnalysis {
  score: number;
  checks: SeoCheck[];
}

export interface SeoCheck {
  label: string;
  passed: boolean;
  message: string;
}
