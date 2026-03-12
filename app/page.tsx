'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { EditorPanel } from '@/components/EditorPanel';
import { PostListPanel } from '@/components/PostListPanel';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { analyzeSeo } from '@/lib/seo';
import { clearDraft, loadDraft, loadPosts, saveDraft, savePosts } from '@/lib/storage';
import { EditorDraft, Post, PostStatus, Role } from '@/lib/types';

const defaultDraft: EditorDraft = {
  title: '',
  content: '',
  metaDescription: '',
  category: '',
  tagsInput: '',
  scheduledFor: ''
};

function parseTags(input: string): string[] {
  return input
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
}

function makeExcerpt(text: string): string {
  const raw = text.replace(/\s+/g, ' ').trim();
  if (raw.length <= 160) return raw;
  return `${raw.slice(0, 160)}...`;
}

function buildHook(title: string, category: string): string {
  const safeTitle = title.trim() || 'this topic';
  const safeCategory = category.trim() || 'content creation';
  const hooks = [
    `What if everything you knew about ${safeCategory} was only half the story?`,
    `Before we dive in, here is the twist: most people fail at ${safeTitle} for one surprisingly simple reason.`,
    `Confession: I used to overcomplicate ${safeTitle} — until a deadline forced a smarter playbook.`,
    `The internet loves shortcuts, but in ${safeCategory}, one strategic habit beats ten hacks.`
  ];
  return hooks[Math.floor(Math.random() * hooks.length)];
}

export default function HomePage() {
  const [role, setRole] = useState<Role>('writer');
  const [posts, setPosts] = useState<Post[]>([]);
  const [draft, setDraft] = useState<EditorDraft>(defaultDraft);
  const [statusMessage, setStatusMessage] = useState('Autosave enabled. Your draft is protected locally.');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PostStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [activeTab, setActiveTab] = useState<'studio' | 'posts' | 'analytics'>('studio');

  useEffect(() => {
    setPosts(loadPosts());
    const storedDraft = loadDraft();
    if (storedDraft) setDraft(storedDraft);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      saveDraft(draft);
      setStatusMessage('Draft autosaved.');
    }, 700);

    return () => window.clearTimeout(timeout);
  }, [draft]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setPosts((prev) => {
        const now = Date.now();
        let changed = false;

        const next = prev.map((post) => {
          if (post.status === 'scheduled' && post.scheduledFor && new Date(post.scheduledFor).getTime() <= now) {
            changed = true;
            return {
              ...post,
              status: 'published',
              updatedAt: new Date().toISOString(),
              views: post.views + Math.floor(Math.random() * 40) + 5
            };
          }
          return post;
        });

        if (changed) {
          savePosts(next);
          setStatusMessage('Scheduled post(s) moved to published.');
        }

        return next;
      });
    }, 30_000);

    return () => window.clearInterval(timer);
  }, []);

  const seo = useMemo(
    () => analyzeSeo(draft.title, draft.content, draft.metaDescription, parseTags(draft.tagsInput)),
    [draft]
  );

  const filteredPosts = useMemo(() => {
    return posts
      .filter((post) => {
        const textMatch =
          search.trim().length === 0 ||
          `${post.title} ${post.content} ${post.tags.join(' ')} ${post.category}`
            .toLowerCase()
            .includes(search.toLowerCase());
        const statusMatch = statusFilter === 'all' || post.status === statusFilter;
        const categoryMatch =
          categoryFilter.trim().length === 0 ||
          post.category.toLowerCase().includes(categoryFilter.toLowerCase());
        return textMatch && statusMatch && categoryMatch;
      })
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [posts, search, statusFilter, categoryFilter]);

  const resetDraft = () => {
    setDraft(defaultDraft);
    clearDraft();
    setStatusMessage('Editor cleared.');
  };

  const persistPost = (status: PostStatus) => {
    if (!draft.title.trim() || !draft.content.trim()) {
      setStatusMessage('Title and content are required.');
      return;
    }

    if (status === 'scheduled' && !draft.scheduledFor) {
      setStatusMessage('Pick a schedule date/time first.');
      return;
    }

    if (status === 'published' && role === 'writer') {
      setStatusMessage('Writer role cannot publish immediately. Switch to editor/admin.');
      return;
    }

    const tags = parseTags(draft.tagsInput);
    const nowIso = new Date().toISOString();

    const post: Post = {
      id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : String(Date.now()),
      title: draft.title.trim(),
      content: draft.content.trim(),
      metaDescription: draft.metaDescription.trim(),
      excerpt: makeExcerpt(draft.content),
      category: draft.category.trim() || 'General',
      tags,
      status,
      scheduledFor: status === 'scheduled' ? new Date(draft.scheduledFor).toISOString() : null,
      seoScore: seo.score,
      authorRole: role,
      views: status === 'published' ? Math.floor(Math.random() * 100) + 25 : 0,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const next = [post, ...posts];
    setPosts(next);
    savePosts(next);

    if (status === 'draft') setStatusMessage('Draft post saved to portal.');
    if (status === 'scheduled') setStatusMessage('Post scheduled successfully.');
    if (status === 'published') setStatusMessage('Post published successfully 🎉');

    resetDraft();
  };

  const deletePost = (id: string) => {
    const next = posts.filter((post) => post.id !== id);
    setPosts(next);
    savePosts(next);
    setStatusMessage('Post deleted.');
  };

  const spiceUpIntro = () => {
    const hook = buildHook(draft.title, draft.category);
    const nextContent = draft.content.trim().length > 0 ? `${hook}\n\n${draft.content}` : `${hook}\n\n`;
    setDraft((prev) => ({ ...prev, content: nextContent }));
    setStatusMessage('Intro upgraded with an entertaining hook ✨');
  };

  return (
    <main className="shell">
      <header className="hero">
        <div>
          <p className="eyebrow">Blog Post Portal</p>
          <h1>Professional Publishing. Entertaining Writing. One Smart Workspace.</h1>
          <p>
            Complete MVP + advanced workflow: role-based creation, autosave drafts, SEO scoring, scheduling,
            searchable portal, and analytics.
          </p>
        </div>
      </header>

      <RoleSwitcher role={role} onChange={setRole} />

      <nav className="tabs" aria-label="Portal sections">
        <button className={`tab ${activeTab === 'studio' ? 'active' : ''}`} onClick={() => setActiveTab('studio')}>
          Studio
        </button>
        <button className={`tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>
          Posts
        </button>
        <button
          className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </nav>

      {activeTab === 'studio' && (
        <EditorPanel
          draft={draft}
          seo={seo}
          canPublishNow={role === 'editor' || role === 'admin'}
          onChange={setDraft}
          onSaveDraftPost={() => persistPost('draft')}
          onPublishNow={() => persistPost('published')}
          onSchedule={() => persistPost('scheduled')}
          onSpiceUpIntro={spiceUpIntro}
          onClear={resetDraft}
          statusMessage={statusMessage}
        />
      )}

      {activeTab === 'posts' && (
        <PostListPanel
          posts={filteredPosts}
          search={search}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          onSearchChange={setSearch}
          onStatusFilterChange={setStatusFilter}
          onCategoryFilterChange={setCategoryFilter}
          onDeletePost={deletePost}
        />
      )}

      {activeTab === 'analytics' && <AnalyticsPanel posts={posts} />}
    </main>
  );
}
