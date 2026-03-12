'use client';

import { Post } from '@/lib/types';
import { scoreColor } from '@/lib/utils';

interface Props {
  posts: Post[];
}

export function AnalyticsPanel({ posts }: Props) {
  const total = posts.length;
  const published = posts.filter((p) => p.status === 'published').length;
  const drafts = posts.filter((p) => p.status === 'draft').length;
  const scheduled = posts.filter((p) => p.status === 'scheduled').length;
  const archived = posts.filter((p) => p.status === 'archived').length;
  const totalViews = posts.reduce((sum, p) => sum + p.views, 0);
  const avgSeo = total > 0 ? Math.round(posts.reduce((sum, p) => sum + p.seoScore, 0) / total) : 0;
  const avgReadTime = total > 0 ? Math.round(posts.reduce((sum, p) => sum + p.readingTime, 0) / total) : 0;

  const topPosts = [...posts]
    .filter((p) => p.status === 'published')
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const categoryMap: Record<string, number> = {};
  posts.forEach((p) => {
    if (p.category) categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
  });
  const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  const maxViews = topPosts.length > 0 ? topPosts[0].views : 1;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 14 }}>
        {[
          { label: 'Total Posts', value: total, emoji: '📝', color: 'var(--accent)' },
          { label: 'Published', value: published, emoji: '🌐', color: '#43e97b' },
          { label: 'Drafts', value: drafts, emoji: '✏️', color: '#8b8fa8' },
          { label: 'Scheduled', value: scheduled, emoji: '📅', color: '#f9ca24' },
          { label: 'Archived', value: archived, emoji: '🗄️', color: '#ff6584' },
          { label: 'Total Views', value: totalViews.toLocaleString(), emoji: '👁️', color: 'var(--accent)' },
          { label: 'Avg SEO Score', value: `${avgSeo}%`, emoji: '🎯', color: scoreColor(avgSeo) },
          { label: 'Avg Read Time', value: `${avgReadTime} min`, emoji: '⏱️', color: 'var(--accent2)' }
        ].map((stat) => (
          <div key={stat.label} style={{
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius)',
            padding: '16px 18px',
            display: 'flex',
            flexDirection: 'column',
            gap: 6
          }}>
            <div style={{ fontSize: '1.4rem' }}>{stat.emoji}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Top posts */}
      {topPosts.length > 0 && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 20
        }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>🏆 Top Performing Posts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topPosts.map((post, i) => (
              <div key={post.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600 }}>{i + 1}. {post.title || '(Untitled)'}</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{post.views} views</span>
                </div>
                <div style={{
                  height: 6,
                  borderRadius: 3,
                  background: 'var(--surface2)',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${(post.views / maxViews) * 100}%`,
                    background: `linear-gradient(90deg, var(--accent), var(--accent2))`,
                    borderRadius: 3,
                    transition: 'width 0.5s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category breakdown */}
      {categories.length > 0 && (
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius)',
          padding: 20
        }}>
          <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 16 }}>📂 Posts by Category</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {categories.map(([cat, count]) => (
              <div key={cat} style={{
                padding: '6px 16px',
                borderRadius: 20,
                background: 'rgba(108,99,255,0.15)',
                border: '1px solid rgba(108,99,255,0.3)',
                fontSize: '0.85rem',
                fontWeight: 600
              }}>
                <span style={{ color: 'var(--accent)' }}>{cat}</span>
                <span style={{ color: 'var(--text-muted)', marginLeft: 8 }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-muted)',
          background: 'var(--surface)',
          borderRadius: 'var(--radius)',
          border: '1px dashed var(--border)'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📊</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>No analytics yet</div>
          <div style={{ fontSize: '0.85rem', marginTop: 6 }}>Start publishing posts to see your stats here.</div>
        </div>
      )}
    </div>
  );
}
