export type Role = 'writer' | 'editor' | 'admin';

export type PostStatus = 'draft' | 'scheduled' | 'published';

export interface Post {
  id: string;
  title: string;
  content: string;
  metaDescription: string;
  excerpt: string;
  category: string;
  tags: string[];
  status: PostStatus;
  scheduledFor: string | null;
  seoScore: number;
  authorRole: Role;
  views: number;
  createdAt: string;
  updatedAt: string;
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
  checks: {
    titleLength: boolean;
    contentLength: boolean;
    metaDescriptionLength: boolean;
    keywordInTitle: boolean;
    keywordInContent: boolean;
    hasTags: boolean;
  };
  suggestions: string[];
}
