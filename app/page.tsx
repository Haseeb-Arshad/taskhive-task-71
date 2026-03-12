'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnalyticsPanel } from '@/components/AnalyticsPanel';
import { EditorPanel } from '@/components/EditorPanel';
import { PostListPanel } from '@/components/PostListPanel';
import { RoleSwitcher } from '@/components/RoleSwitcher';
import { analyzeSeo } from '@/lib/seo';
import { clearDraft, loadDraft, loadPosts, saveDraft, savePosts } from '@/lib/storage';
import { EditorDraft, Post, PostStatus, Role } from '@/lib/types';
import { generateId, readingTime } from '@/lib/utils';

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
    `What if everything you knew about ${safeCategory} was only half the story?\n\n`,
    `Before we dive in, here is the twist: most people fail at "${safeTitle}" for one surprisingly simple reason.\n\n`,
    `Confession: I used to overcomplicate "${safeTitle}" — until a deadline forced a smarter playbook.\n\n`,
    `The internet loves shortcuts, but in ${safeCategory}, one strategic habit beats ten hacks.\n\n`
  ];
  return hooks[Math.floor(Math.random() * hooks.length)];
}

export default function HomePage() {
  const [role, setRole] = useState<Role>('writer');
  const [posts, setPosts] = useState<Post[]>([]);
  const [draft, setDraft] = useState<EditorDraft>(defaultDraft);
  const [statusMessage, setStatusMessage] = useState('Autosave enabled. Your draft is protected locally.');
  const [editingId, setEditingId] = useState<string | null>(null);

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
              status: 'published' as PostStatus,
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
    return posts.filter((post) => {
      const textMatch =
        search.trim().length === 0 ||
        `${post.title} ${post.content} ${post.tags.join(' ')} ${post.category}`
          .toLowerCase()
          .includes(search.toLowerCase());
      const statusMatch = statusFilter === 'all' || post.status === statusFilter;
      const categoryMatch =
        categoryFilter.trim().length === 0 ||
        post.category.toLowerCase() === categoryFilter.toLowerCase();
      return textMatch && statusMatch && categoryMatch;
    });
  }, [posts, search, statusFilter, categoryFilter]);

  function commitPost(status: PostStatus) {
    const tags = parseTags(draft.tagsInput);
    const now = new Date().toISOString();

    if (editingId) {
      const updated = posts.map((p) =>
        p.id === editingId
          ? {
              ...p,
              title: draft.title,
              content: draft.content,
              excerpt: makeExcerpt(draft.content),
              metaDescription: draft.metaDescription,
              category: draft.category,
              tags,
              status,
              updatedAt: now,
              scheduledFor: draft.scheduledFor || undefined,
              seoScore: seo.score,
              readingTime: readingTime(draft.content)
            }
          : p
      );
      savePosts(updated);
      setPosts(updated);
      setEditingId(null);
    } else {
      const newPost: Post = {
        id: generateId(),
        title: draft.title,
        content: draft.content,
        excerpt: makeExcerpt(draft.content),
        metaDescription: draft.metaDescription,
        category: draft.category,
        tags,
        status,
        author: role === 'admin' ? 'Admin' : role === 'editor' ? 'Editor' : 'Writer',
        createdAt: now,
        updatedAt: now,
        scheduledFor: draft.scheduledFor || undefined,
        seoScore: seo.score,
        views: 0,
        readingTime: readingTime(draft.content)
      };
      const next = [newPost, ...posts];
      savePosts(next);
      setPosts(next);
    }

    clearDraft();
    setDraft(defaultDraft);
    setStatusMessage(`Post ${status === 'published' ? 'published' : status === 'scheduled' ? 'scheduled' : 'saved as draft'}!`);
    setActiveTab('posts');
  }

  function handleEdit(post: Post) {
    setDraft({
      title: post.title,
      content: post.content,
      metaDescription: post.metaDescription,
      category: post.category,
      tagsInput: post.tags.join(', '),
      scheduledFor: post.scheduledFor || ''
    });
    setEditingId(post.id);
    setActiveTab('studio');
  }

  function handleDelete(id: string) {
    if (!confirm('Delete this post permanently?')) return;
    const next = posts.filter((p) => p.id !== id);
    savePosts(next);
    setPosts(next);
  }

  function handleArchive(id: string) {
    const next = posts.map((p) =>
      p.id === id ? { ...p, status: 'archived' as PostStatus, updatedAt: new Date().toISOString() } : p
    );
    savePosts(next);
    setPosts(next);
  }

  function handleChangeStatus(id: string, status: PostStatus) {
    const next = posts.map((p) =>
      p.id === id ? { ...p, status, updatedAt: new Date().toISOString() } : p
    );
    savePosts(next);
    setPosts(next);
  }

  function handleInjectHook() {
    const hook = buildHook(draft.title, draft.category);
    setDraft((prev) => ({ ...prev, content: hook + prev.content }));
  }

  const tabs: { key: 'studio' | 'posts' | 'analytics'; label: string; emoji: string }[] = [
    { key: 'studio', label: 'Writing Studio', emoji: '✍️' },
    { key: 'posts', label: `Posts (${posts.length})`, emoji: '📚' },
    { key: 'analytics', label: 'Analytics', emoji: '📊' }
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 2px 16px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 12,
          padding: '14px 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem'
            }}>✍️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>Blog Post Portal</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Professional · Entertaining · SEO-Powered</div>
            </div>
          </div>
          <RoleSwitcher role={role} onChange={setRole} />
        </div>

        {/* Tabs */}
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', gap: 4 }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '10px 20px',
                borderRadius: '8px 8px 0 0',
                fontWeight: 700,
                fontSize: '0.88rem',
                background: activeTab === tab.key ? 'var(--bg)' : 'transparent',
                color: activeTab === tab.key ? 'var(--accent)' : 'var(--text-muted)',
                borderBottom: activeTab === tab.key ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.2s'
              }}
            >
              {tab.emoji} {tab.label}
            </button>
          ))}
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {activeTab === 'studio' && (
          <EditorPanel
            draft={draft}
            onChange={setDraft}
            onPublish={() => commitPost('published')}
            onSaveDraft={() => commitPost('draft')}
            onSchedule={() => commitPost('scheduled')}
            onClear={() => { setDraft(defaultDraft); clearDraft(); setEditingId(null); setStatusMessage('Draft cleared.'); }}
            onInjectHook={handleInjectHook}
            seo={seo}
            role={role}
            statusMessage={statusMessage}
          />
        )}

        {activeTab === 'posts' && (
          <PostListPanel
            posts={filteredPosts}
            role={role}
            search={search}
            onSearchChange={setSearch}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            categoryFilter={categoryFilter}
            onCategoryFilterChange={setCategoryFilter}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onArchive={handleArchive}
            onChangeStatus={handleChangeStatus}
          />
        )}

        {activeTab === 'analytics' && (
          role === 'admin'
            ? <AnalyticsPanel posts={posts} />
            : (
              <div style={{
                textAlign: 'center',
                padding: '80px 20px',
                color: 'var(--text-muted)'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>🔒</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Admin Access Required</div>
                <div style={{ marginTop: 8, fontSize: '0.9rem' }}>Switch to the Admin role to view analytics.</div>
              </div>
            )
        )}
      </main>
    </div>
  );
}
