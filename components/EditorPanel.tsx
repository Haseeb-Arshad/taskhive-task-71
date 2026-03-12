import { EditorDraft, SeoAnalysis } from '@/lib/types';

type EditorPanelProps = {
  draft: EditorDraft;
  seo: SeoAnalysis;
  canPublishNow: boolean;
  onChange: (next: EditorDraft) => void;
  onSaveDraftPost: () => void;
  onPublishNow: () => void;
  onSchedule: () => void;
  onSpiceUpIntro: () => void;
  onClear: () => void;
  statusMessage: string;
};

export function EditorPanel({
  draft,
  seo,
  canPublishNow,
  onChange,
  onSaveDraftPost,
  onPublishNow,
  onSchedule,
  onSpiceUpIntro,
  onClear,
  statusMessage
}: EditorPanelProps) {
  const update = <K extends keyof EditorDraft>(key: K, value: EditorDraft[K]) => {
    onChange({ ...draft, [key]: value });
  };

  return (
    <section className="panel">
      <div className="editor-header-row">
        <div>
          <h2 className="panel-title">Creator Studio</h2>
          <p className="panel-subtitle">
            Write like a pro. Entertain like a storyteller. Publish with confidence.
          </p>
        </div>
        <div className={`seo-pill ${seo.score >= 80 ? 'good' : seo.score >= 55 ? 'ok' : 'bad'}`}>
          SEO Score: {seo.score}
        </div>
      </div>

      <div className="editor-grid">
        <label className="field">
          <span>Title</span>
          <input
            value={draft.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="e.g. The Future of AI Storytelling in Content Marketing"
          />
        </label>

        <label className="field">
          <span>Category</span>
          <input
            value={draft.category}
            onChange={(e) => update('category', e.target.value)}
            placeholder="Writing, Marketing, Tech, Lifestyle..."
          />
        </label>

        <label className="field full">
          <span>Meta Description (120–160 chars)</span>
          <textarea
            value={draft.metaDescription}
            onChange={(e) => update('metaDescription', e.target.value)}
            rows={2}
            placeholder="Summarize your post in a search-friendly way."
          />
        </label>

        <label className="field full">
          <span>Content</span>
          <textarea
            value={draft.content}
            onChange={(e) => update('content', e.target.value)}
            rows={10}
            placeholder="Start writing your entertaining and professional article here..."
          />
        </label>

        <label className="field">
          <span>Tags (comma-separated)</span>
          <input
            value={draft.tagsInput}
            onChange={(e) => update('tagsInput', e.target.value)}
            placeholder="seo, storytelling, content strategy"
          />
        </label>

        <label className="field">
          <span>Schedule for</span>
          <input
            type="datetime-local"
            value={draft.scheduledFor}
            onChange={(e) => update('scheduledFor', e.target.value)}
          />
        </label>
      </div>

      <div className="action-row">
        <button className="btn ghost" type="button" onClick={onSpiceUpIntro}>
          Spice Up Intro ✨
        </button>
        <button className="btn" type="button" onClick={onSaveDraftPost}>
          Save as Draft
        </button>
        <button className="btn warning" type="button" onClick={onSchedule}>
          Schedule Post
        </button>
        <button className="btn success" type="button" disabled={!canPublishNow} onClick={onPublishNow}>
          Publish Now
        </button>
        <button className="btn danger" type="button" onClick={onClear}>
          Clear
        </button>
      </div>

      <div className="status-line" aria-live="polite">
        {statusMessage}
      </div>

      <div className="seo-checks" aria-label="SEO checklist">
        <h3>SEO Checklist</h3>
        <ul>
          <li className={seo.checks.titleLength ? 'pass' : 'fail'}>Title length optimized</li>
          <li className={seo.checks.contentLength ? 'pass' : 'fail'}>Content length is substantial</li>
          <li className={seo.checks.metaDescriptionLength ? 'pass' : 'fail'}>
            Meta description length is ideal
          </li>
          <li className={seo.checks.keywordInTitle ? 'pass' : 'fail'}>Primary keyword in title</li>
          <li className={seo.checks.keywordInContent ? 'pass' : 'fail'}>Primary keyword in content</li>
          <li className={seo.checks.hasTags ? 'pass' : 'fail'}>Multiple tags attached</li>
        </ul>
        {seo.suggestions.length > 0 && (
          <div className="seo-suggestions">
            {seo.suggestions.map((item) => (
              <p key={item}>• {item}</p>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
