'use client';

import { Post, PostStatus, Role } from '@/lib/types';
import { formatDate, scoreColor } from '@/lib/utils';

interface Props {
  posts: Post[];
  role: Role;
  search: string;
  onSearchChange: (v: string) => void;
  statusFilter: PostStatus | 'all';
  onStatusFilterChange: (v: PostStatus | 'all') => void;
  categoryFilter: string;
  onCategoryFilterChange: (v: string) => void;
  onEdit: (post: Post) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onChangeStatus: (id: string, status: PostStatus) => void;
}

const STATUS_COLORS: Record<PostStatus, string> = {
  draft: '#8b8fa8',
  published: '#43e97b',
  scheduled: '#f9ca24',
  archived: '#ff6584'
};

const STATUS_EMOJI: Record<PostStatus, string> = {
  draft: '📝',
  published: '🌐',
  scheduled: '📅',
  archived: '🗄️'
};

export function PostListPanel({
  posts, role, search, onSearchChange, statusFilter, onStatusFilterChange,
  categoryFilter, onCategoryFilterChange, onEdit, onDelete, onArchive, onChangeStatus
}: Props) {
  const canEdit = role === 'editor' || role === 'admin';
  const canDelete = role === 'admin';

  const categories = Array.from(new Set(posts.map((p) => p.category).filter(Boolean)));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="🔍 Search posts..."
          style={{ flex: '1 1 200px', minWidth: 160 }}
        />
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as PostStatus | 'all')}
          style={{ flex: '0 1 140px' }}
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="scheduled">Scheduled</option>
          <option value="archived">Archived</option>
        </select>
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          style={{ flex: '0 1 160px' }}
        >
          <option value="">All Categories</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {posts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-muted)',
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          border: '1px dashed var(--border)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📭</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>No posts found</div>
          <div style={{ fontSize: '0.85rem', marginTop: 6 }}>Try adjusting your filters or write your first post!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {posts.map((post) => (
            <div key={post.id} style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '18px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              transition: 'border-color 0.2s'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      padding: '2px 10px',
                      borderRadius: 12,
                      background: STATUS_COLORS[post.status] + '22',
                      color: STATUS_COLORS[post.status],
                      border: `1px solid ${STATUS_COLORS[post.status]}44`
                    }}>
                      {STATUS_EMOJI[post.status]} {post.status.toUpperCase()}
                    </span>
                    {post.category && (
                      <span style={{
                        fontSize: '0.75rem',
                        padding: '2px 10px',
                        borderRadius: 12,
                        background: 'var(--surface2)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border)'
                      }}>
                        {post.category}
                      </span>
                    )}
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: scoreColor(post.seoScore)
                    }}>
                      SEO {post.seoScore}%
                    </span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', lineHeight: 1.3 }}>{post.title || '(Untitled)'}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4, lineHeight: 1.5 }}>{post.excerpt}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                <span>👤 {post.author}</span>
                <span>📅 {formatDate(post.createdAt)}</span>
                <span>👁️ {post.views} views</span>
                <span>⏱️ {post.readingTime} min read</span>
                {post.scheduledFor && <span>🕐 Scheduled: {formatDate(post.scheduledFor)}</span>}
              </div>

              {post.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {post.tags.map((tag) => (
                    <span key={tag} style={{
                      fontSize: '0.72rem',
                      padding: '2px 8px',
                      borderRadius: 10,
                      background: 'rgba(108,99,255,0.15)',
                      color: 'var(--accent)',
                      border: '1px solid rgba(108,99,255,0.3)'
                    }}>
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                <button
                  onClick={() => onEdit(post)}
                  style={smallBtn('var(--accent)', '#fff')}
                >
                  ✏️ Edit
                </button>
                {canEdit && post.status === 'draft' && (
                  <button
                    onClick={() => onChangeStatus(post.id, 'published')}
                    style={smallBtn('#43e97b', '#1a1d27')}
                  >
                    🚀 Publish
                  </button>
                )}
                {canEdit && post.status !== 'archived' && (
                  <button
                    onClick={() => onArchive(post.id)}
                    style={smallBtn('var(--surface2)', 'var(--text-muted)')}
                  >
                    🗄️ Archive
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => onDelete(post.id)}
                    style={smallBtn('rgba(255,101,132,0.15)', 'var(--accent2)')}
                  >
                    🗑️ Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function smallBtn(bg: string, color: string): React.CSSProperties {
  return {
    padding: '5px 14px',
    borderRadius: 6,
    fontSize: '0.8rem',
    fontWeight: 600,
    background: bg,
    color,
    border: '1px solid var(--border)'
  };
}
