import { Post, PostStatus } from '@/lib/types';

type PostListPanelProps = {
  posts: Post[];
  search: string;
  statusFilter: PostStatus | 'all';
  categoryFilter: string;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: PostStatus | 'all') => void;
  onCategoryFilterChange: (value: string) => void;
  onDeletePost: (id: string) => void;
};

function formatDate(date: string): string {
  return new Date(date).toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

export function PostListPanel({
  posts,
  search,
  statusFilter,
  categoryFilter,
  onSearchChange,
  onStatusFilterChange,
  onCategoryFilterChange,
  onDeletePost
}: PostListPanelProps) {
  return (
    <section className="panel">
      <div className="editor-header-row">
        <div>
          <h2 className="panel-title">Portal Posts</h2>
          <p className="panel-subtitle">Search and moderate your content pipeline.</p>
        </div>
      </div>

      <div className="filters-row">
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by title, content, tag..."
        />
        <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as PostStatus | 'all')}>
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="published">Published</option>
        </select>
        <input
          value={categoryFilter}
          onChange={(e) => onCategoryFilterChange(e.target.value)}
          placeholder="Filter category"
        />
      </div>

      <div className="post-list" role="list">
        {posts.length === 0 && <p className="empty-state">No posts match your filters.</p>}

        {posts.map((post) => (
          <article key={post.id} className="post-card" role="listitem">
            <div className="post-card-head">
              <h3>{post.title}</h3>
              <span className={`badge ${post.status}`}>{post.status}</span>
            </div>
            <p>{post.excerpt}</p>
            <div className="meta-row">
              <span>Category: {post.category || 'Uncategorized'}</span>
              <span>SEO: {post.seoScore}</span>
              <span>Views: {post.views.toLocaleString()}</span>
            </div>
            <div className="meta-row">
              <span>Created: {formatDate(post.createdAt)}</span>
              <span>Updated: {formatDate(post.updatedAt)}</span>
              {post.scheduledFor && <span>Scheduled: {formatDate(post.scheduledFor)}</span>}
            </div>
            <div className="tags-row">
              {post.tags.map((tag) => (
                <span key={`${post.id}-${tag}`} className="tag">
                  #{tag}
                </span>
              ))}
            </div>
            <div className="card-actions">
              <button className="btn danger" onClick={() => onDeletePost(post.id)} type="button">
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
