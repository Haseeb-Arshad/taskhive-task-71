'use client';

import { SeoPanel } from '@/components/SeoPanel';
import { SeoAnalysis, EditorDraft, Role } from '@/lib/types';

interface Props {
  draft: EditorDraft;
  onChange: (d: EditorDraft) => void;
  onPublish: () => void;
  onSaveDraft: () => void;
  onSchedule: () => void;
  onClear: () => void;
  onInjectHook: () => void;
  seo: SeoAnalysis;
  role: Role;
  statusMessage: string;
}

const CATEGORIES = ['Technology', 'Lifestyle', 'Business', 'Health', 'Travel', 'Food', 'Finance', 'Education', 'Entertainment', 'Science'];

export function EditorPanel({
  draft, onChange, onPublish, onSaveDraft, onSchedule, onClear, onInjectHook, seo, role, statusMessage
}: Props) {
  const set = (key: keyof EditorDraft, value: string) => onChange({ ...draft, [key]: value });

  const wordCount = draft.content.trim().split(/\s+/).filter(Boolean).length;
  const readMins = Math.max(1, Math.ceil(wordCount / 200));

  const canPublish = role === 'editor' || role === 'admin';
  const canSchedule = role === 'editor' || role === 'admin';

  return (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      {/* Left: Editor */}
      <div style={{ flex: '1 1 480px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Status bar */}
        <div style={{
          padding: '8px 14px',
          borderRadius: 8,
          background: 'var(--surface2)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          border: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 8
        }}>
          <span>💾 {statusMessage}</span>
          <span>{wordCount} words · ~{readMins} min read</span>
        </div>

        {/* Title */}
        <div>
          <label style={labelStyle}>Post Title *</label>
          <input
            value={draft.title}
            onChange={(e) => set('title', e.target.value)}
            placeholder="Write a compelling, keyword-rich title..."
            style={{ width: '100%', fontSize: '1.1rem', padding: '12px 16px' }}
          />
          <div style={charCountStyle}>{draft.title.length}/70 chars</div>
        </div>

        {/* Category + Tags row */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={labelStyle}>Category</label>
            <select
              value={draft.category}
              onChange={(e) => set('category', e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Select category...</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ flex: '2 1 240px' }}>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input
              value={draft.tagsInput}
              onChange={(e) => set('tagsInput', e.target.value)}
              placeholder="e.g. react, nextjs, webdev"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Meta description */}
        <div>
          <label style={labelStyle}>Meta Description (120–160 chars for SEO)</label>
          <textarea
            value={draft.metaDescription}
            onChange={(e) => set('metaDescription', e.target.value)}
            placeholder="Summarise your post for search engines..."
            rows={2}
            style={{ width: '100%', resize: 'vertical' }}
          />
          <div style={charCountStyle}>{draft.metaDescription.length}/160 chars</div>
        </div>

        {/* Content */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <label style={{ ...labelStyle, margin: 0 }}>Content (Markdown supported)</label>
            <button
              onClick={onInjectHook}
              style={{
                fontSize: '0.78rem',
                padding: '4px 12px',
                borderRadius: 6,
                background: 'var(--accent2)',
                color: '#fff',
                fontWeight: 600
              }}
            >
              ✨ Inject Hook
            </button>
          </div>
          <textarea
            value={draft.content}
            onChange={(e) => set('content', e.target.value)}
            placeholder={`Start writing your masterpiece...\n\nTips:\n## Use headings for structure\n- Bullet points work great\n**Bold** and *italic* for emphasis`}
            rows={18}
            style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace', lineHeight: 1.7 }}
          />
        </div>

        {/* Schedule */}
        {canSchedule && (
          <div>
            <label style={labelStyle}>Schedule Publish Date (optional)</label>
            <input
              type="datetime-local"
              value={draft.scheduledFor}
              onChange={(e) => set('scheduledFor', e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={onSaveDraft} style={btnStyle('var(--surface2)', 'var(--text)')}>
            💾 Save Draft
          </button>
          {canPublish && (
            <button onClick={onPublish} style={btnStyle('var(--accent)', '#fff')}>
              🚀 Publish Now
            </button>
          )}
          {canSchedule && draft.scheduledFor && (
            <button onClick={onSchedule} style={btnStyle('#f9ca24', '#1a1d27')}>
              📅 Schedule
            </button>
          )}
          <button onClick={onClear} style={btnStyle('var(--surface2)', 'var(--accent2)')}>
            🗑️ Clear
          </button>
        </div>
      </div>

      {/* Right: SEO Panel */}
      <div style={{ flex: '0 1 320px', minWidth: 260 }}>
        <SeoPanel seo={seo} />
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.82rem',
  fontWeight: 600,
  color: 'var(--text-muted)',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.05em'
};

const charCountStyle: React.CSSProperties = {
  fontSize: '0.75rem',
  color: 'var(--text-muted)',
  textAlign: 'right',
  marginTop: 4
};

function btnStyle(bg: string, color: string): React.CSSProperties {
  return {
    padding: '10px 20px',
    borderRadius: 8,
    fontWeight: 700,
    fontSize: '0.9rem',
    background: bg,
    color,
    border: '1px solid var(--border)',
    transition: 'opacity 0.2s'
  };
}
