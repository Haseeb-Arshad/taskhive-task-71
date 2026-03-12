import { Post } from '@/lib/types';

type AnalyticsPanelProps = {
  posts: Post[];
};

export function AnalyticsPanel({ posts }: AnalyticsPanelProps) {
  const total = posts.length;
  const published = posts.filter((p) => p.status === 'published').length;
  const drafts = posts.filter((p) => p.status === 'draft').length;
  const scheduled = posts.filter((p) => p.status === 'scheduled').length;
  const avgSeo = total ? Math.round(posts.reduce((acc, p) => acc + p.seoScore, 0) / total) : 0;
  const totalViews = posts.reduce((acc, p) => acc + p.views, 0);

  const tags = posts.flatMap((post) => post.tags);
  const tagCounts = tags.reduce<Record<string, number>>((acc, tag) => {
    acc[tag] = (acc[tag] ?? 0) + 1;
    return acc;
  }, {});
  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  const maxTag = topTags[0]?.[1] ?? 1;

  return (
    <section className="panel">
      <div className="editor-header-row">
        <div>
          <h2 className="panel-title">Analytics</h2>
          <p className="panel-subtitle">Editorial health and publishing momentum at a glance.</p>
        </div>
      </div>

      <div className="stats-grid">
        <article className="stat-card">
          <h3>{total}</h3>
          <p>Total Posts</p>
        </article>
        <article className="stat-card">
          <h3>{published}</h3>
          <p>Published</p>
        </article>
        <article className="stat-card">
          <h3>{scheduled}</h3>
          <p>Scheduled</p>
        </article>
        <article className="stat-card">
          <h3>{drafts}</h3>
          <p>Drafts</p>
        </article>
        <article className="stat-card">
          <h3>{avgSeo}</h3>
          <p>Avg SEO Score</p>
        </article>
        <article className="stat-card">
          <h3>{totalViews.toLocaleString()}</h3>
          <p>Total Views</p>
        </article>
      </div>

      <div className="tag-chart">
        <h3>Top Tags</h3>
        {topTags.length === 0 && <p className="empty-state">No tag data yet.</p>}
        {topTags.map(([tag, count]) => (
          <div className="tag-bar-row" key={tag}>
            <span className="tag-label">#{tag}</span>
            <div className="tag-bar-wrap">
              <div className="tag-bar" style={{ width: `${Math.max((count / maxTag) * 100, 6)}%` }} />
            </div>
            <span className="tag-count">{count}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
