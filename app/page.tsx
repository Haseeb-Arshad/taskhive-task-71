"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CATEGORIES,
  type BlogPost,
  type EditorDraft,
  type Role,
  calculateSeoScore,
  createSlug,
  estimateReadTime,
  parseTags,
  stripMarkdown,
} from "@/lib/blog";
import {
  clearDraft,
  loadDraft,
  loadPosts,
  loadRole,
  saveDraft,
  savePosts,
  saveRole,
} from "@/lib/persistence";

type Tab = "editor" | "posts" | "portal" | "analytics";

const EMPTY_EDITOR: EditorDraft = {
  id: null,
  title: "",
  excerpt: "",
  content: "",
  category: CATEGORIES[0],
  tagsInput: "",
  seoKeyword: "",
  metaDescription: "",
  scheduledAt: "",
};

function nowISODateTimeLocal(): string {
  const d = new Date(Date.now() + 5 * 60 * 1000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const mins = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${mins}`;
}

function renderArticle(content: string): string {
  const escaped = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .split("\n")
    .map((line) => {
      if (line.startsWith("### ")) return `<h3>${line.slice(4)}</h3>`;
      if (line.startsWith("## ")) return `<h2>${line.slice(3)}</h2>`;
      if (line.startsWith("# ")) return `<h2>${line.slice(2)}</h2>`;
      if (!line.trim()) return "";
      return `<p>${line}</p>`;
    })
    .join("\n");
}

export default function HomePage() {
  const [tab, setTab] = useState<Tab>("editor");
  const [role, setRole] = useState<Role>("writer");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editor, setEditor] = useState<EditorDraft>(EMPTY_EDITOR);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [autosaveStamp, setAutosaveStamp] = useState<string>("Never");

  useEffect(() => {
    setPosts(loadPosts());
    setRole(loadRole());
    const cachedDraft = loadDraft();
    if (cachedDraft) setEditor(cachedDraft);
  }, []);

  useEffect(() => {
    savePosts(posts);
  }, [posts]);

  useEffect(() => {
    saveRole(role);
  }, [role]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveDraft(editor);
      setAutosaveStamp(new Date().toLocaleTimeString());
    }, 900);

    return () => window.clearTimeout(timer);
  }, [editor]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const now = Date.now();
      setPosts((prev) =>
        prev.map((post) => {
          if (post.status !== "scheduled" || !post.scheduledAt) return post;
          if (new Date(post.scheduledAt).getTime() <= now) {
            return {
              ...post,
              status: "published",
              publishedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
          }
          return post;
        })
      );
    }, 30000);

    return () => window.clearInterval(interval);
  }, []);

  const seo = useMemo(() => {
    return calculateSeoScore({
      title: editor.title,
      content: editor.content,
      seoKeyword: editor.seoKeyword,
      metaDescription: editor.metaDescription,
      tags: parseTags(editor.tagsInput),
    });
  }, [editor]);

  const filteredPosts = useMemo(() => {
    const q = search.toLowerCase();
    return posts
      .filter((post) => (categoryFilter === "all" ? true : post.category === categoryFilter))
      .filter((post) => {
        if (!q) return true;
        return (
          post.title.toLowerCase().includes(q) ||
          post.excerpt.toLowerCase().includes(q) ||
          post.tags.join(" ").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt));
  }, [posts, search, categoryFilter]);

  const publishedPosts = useMemo(
    () => filteredPosts.filter((p) => p.status === "published"),
    [filteredPosts]
  );

  const selectedPost = useMemo(
    () => posts.find((p) => p.id === selectedPostId) ?? null,
    [posts, selectedPostId]
  );

  const stats = useMemo(() => {
    const totalViews = posts.reduce((sum, p) => sum + p.analytics.views, 0);
    const totalLikes = posts.reduce((sum, p) => sum + p.analytics.likes, 0);
    const published = posts.filter((p) => p.status === "published").length;
    const scheduled = posts.filter((p) => p.status === "scheduled").length;
    const drafts = posts.filter((p) => p.status === "draft").length;
    const avgSeo = posts.length
      ? Math.round(posts.reduce((sum, p) => sum + p.seoScore, 0) / posts.length)
      : 0;

    return { totalViews, totalLikes, published, scheduled, drafts, avgSeo };
  }, [posts]);

  function resetEditor() {
    setEditor(EMPTY_EDITOR);
    clearDraft();
  }

  function upsertPost(nextStatus: BlogPost["status"]) {
    if (!editor.title.trim() || !editor.content.trim()) {
      alert("Title and content are required.");
      return;
    }

    if (nextStatus === "published" && role === "writer") {
      alert("Writer role cannot publish directly. Switch to editor/admin.");
      return;
    }

    const tags = parseTags(editor.tagsInput);
    const score = calculateSeoScore({
      title: editor.title,
      content: editor.content,
      seoKeyword: editor.seoKeyword,
      metaDescription: editor.metaDescription,
      tags,
    }).score;

    const timestamp = new Date().toISOString();
    const base: BlogPost = {
      id: editor.id ?? crypto.randomUUID(),
      slug: createSlug(editor.title),
      title: editor.title.trim(),
      excerpt: editor.excerpt.trim() || stripMarkdown(editor.content).slice(0, 140),
      content: editor.content,
      category: editor.category,
      tags,
      status: nextStatus,
      seoKeyword: editor.seoKeyword.trim(),
      metaDescription: editor.metaDescription.trim(),
      seoScore: score,
      authorName: role === "writer" ? "Writer Desk" : role === "editor" ? "Editorial Team" : "Admin Team",
      createdAt: timestamp,
      updatedAt: timestamp,
      scheduledAt: nextStatus === "scheduled" ? new Date(editor.scheduledAt).toISOString() : null,
      publishedAt: nextStatus === "published" ? timestamp : null,
      analytics: {
        views: 0,
        likes: 0,
        readTimeMinutes: estimateReadTime(editor.content),
      },
    };

    setPosts((prev) => {
      const existing = prev.find((p) => p.id === base.id);
      if (!existing) return [base, ...prev];

      return prev.map((p) =>
        p.id === base.id
          ? {
              ...p,
              ...base,
              createdAt: p.createdAt,
              analytics: p.analytics,
            }
          : p
      );
    });

    resetEditor();
    setTab("posts");
  }

  function editPost(post: BlogPost) {
    setEditor({
      id: post.id,
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      tagsInput: post.tags.join(", "),
      seoKeyword: post.seoKeyword,
      metaDescription: post.metaDescription,
      scheduledAt: post.scheduledAt ? post.scheduledAt.slice(0, 16) : nowISODateTimeLocal(),
    });
    setTab("editor");
  }

  function deletePost(id: string) {
    if (!confirm("Delete this post permanently?")) return;
    setPosts((prev) => prev.filter((p) => p.id !== id));
    if (selectedPostId === id) setSelectedPostId(null);
  }

  function quickPublish(id: string) {
    if (role === "writer") {
      alert("Writer role cannot publish directly.");
      return;
    }
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "published",
              publishedAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              scheduledAt: null,
            }
          : p
      )
    );
  }

  function openPost(id: string) {
    setSelectedPostId(id);
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              analytics: { ...p.analytics, views: p.analytics.views + 1 },
            }
          : p
      )
    );
  }

  function likePost(id: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              analytics: { ...p.analytics, likes: p.analytics.likes + 1 },
            }
          : p
      )
    );
  }

  return (
    <main className="portal-shell">
      <header className="hero">
        <h1>📝 Blog Post Portal</h1>
        <p>
          Entertaining + professional publishing suite with roles, SEO scoring, search, scheduling,
          autosave drafts, and analytics.
        </p>
        <div className="row">
          <span className="badge">Current role:</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            aria-label="Switch role"
          >
            <option value="writer">Writer</option>
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <span className="badge">Autosaved: {autosaveStamp}</span>
        </div>
      </header>

      <nav className="nav-tabs" aria-label="Sections">
        <button className={`tab-btn ${tab === "editor" ? "active" : ""}`} onClick={() => setTab("editor")}>Editor</button>
        <button className={`tab-btn ${tab === "posts" ? "active" : ""}`} onClick={() => setTab("posts")}>Manage Posts</button>
        <button className={`tab-btn ${tab === "portal" ? "active" : ""}`} onClick={() => setTab("portal")}>Reader Portal</button>
        <button className={`tab-btn ${tab === "analytics" ? "active" : ""}`} onClick={() => setTab("analytics")}>Analytics</button>
      </nav>

      {tab === "editor" && (
        <section className="grid cols-2">
          <article className="card panel grid">
            <label>
              Post Title
              <input
                value={editor.title}
                onChange={(e) => setEditor((s) => ({ ...s, title: e.target.value }))}
                placeholder="Craft a magnetic title..."
              />
            </label>

            <label>
              Excerpt
              <textarea
                value={editor.excerpt}
                onChange={(e) => setEditor((s) => ({ ...s, excerpt: e.target.value }))}
                style={{ minHeight: 90 }}
                placeholder="Short teaser shown in listing cards"
              />
            </label>

            <label>
              Rich Content (Markdown-friendly)
              <textarea
                value={editor.content}
                onChange={(e) => setEditor((s) => ({ ...s, content: e.target.value }))}
                placeholder="# Headline\n## Subsection\nWrite your article here..."
              />
            </label>

            <div className="grid cols-3">
              <label>
                Category
                <select
                  value={editor.category}
                  onChange={(e) => setEditor((s) => ({ ...s, category: e.target.value }))}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                Tags (comma-separated)
                <input
                  value={editor.tagsInput}
                  onChange={(e) => setEditor((s) => ({ ...s, tagsInput: e.target.value }))}
                  placeholder="seo, storytelling, ai"
                />
              </label>

              <label>
                Primary SEO Keyword
                <input
                  value={editor.seoKeyword}
                  onChange={(e) => setEditor((s) => ({ ...s, seoKeyword: e.target.value }))}
                  placeholder="blog writing"
                />
              </label>
            </div>

            <label>
              Meta Description
              <textarea
                value={editor.metaDescription}
                onChange={(e) => setEditor((s) => ({ ...s, metaDescription: e.target.value }))}
                style={{ minHeight: 90 }}
                placeholder="Search snippet (70-160 chars recommended)."
              />
            </label>

            <div className="row">
              <button className="btn" onClick={() => upsertPost("draft")}>Save Draft</button>
              <button className="btn warn" onClick={() => setEditor((s) => ({ ...s, scheduledAt: s.scheduledAt || nowISODateTimeLocal() }))}>Prepare Schedule</button>
              <button
                className="btn success"
                onClick={() => upsertPost("published")}
                disabled={role === "writer"}
                title={role === "writer" ? "Switch to editor/admin to publish" : "Publish now"}
              >
                Publish Now
              </button>
              <button className="btn danger" onClick={resetEditor}>Reset</button>
            </div>

            <div className="row">
              <label>
                Schedule datetime
                <input
                  type="datetime-local"
                  value={editor.scheduledAt}
                  onChange={(e) => setEditor((s) => ({ ...s, scheduledAt: e.target.value }))}
                />
              </label>
              <button
                className="btn primary"
                onClick={() => {
                  if (!editor.scheduledAt) {
                    alert("Choose a schedule datetime first.");
                    return;
                  }
                  upsertPost("scheduled");
                }}
              >
                Schedule Post
              </button>
            </div>
          </article>

          <aside className="card panel grid">
            <h3 style={{ margin: 0 }}>SEO Assistant</h3>
            <div className="progress" aria-label="SEO score progress">
              <span style={{ width: `${seo.score}%` }} />
            </div>
            <strong>{seo.score}/100 SEO score</strong>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--muted)" }}>
              {seo.checks.map((check, index) => (
                <li key={`${check}-${index}`}>{check}</li>
              ))}
            </ul>
            <hr />
            <h3 style={{ margin: 0 }}>Live Preview</h3>
            <div className="meta-line">
              Read time: {estimateReadTime(editor.content)} min • Slug: {createSlug(editor.title)}
            </div>
            <article className="article" dangerouslySetInnerHTML={{ __html: renderArticle(editor.content) }} />
          </aside>
        </section>
      )}

      {tab === "posts" && (
        <section className="card panel grid">
          <div className="row">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, excerpt, tags..."
              style={{ minWidth: 260 }}
            />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="all">All categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="post-list">
            {filteredPosts.length === 0 && <small>No posts found.</small>}
            {filteredPosts.map((post) => (
              <article className="post-row" key={post.id}>
                <div className="post-row-head">
                  <h4 className="post-title">{post.title}</h4>
                  <span className={`badge status-${post.status}`}>{post.status}</span>
                </div>
                <div className="meta-line">
                  {post.category} • {post.tags.join(", ") || "no tags"} • SEO {post.seoScore}/100 • Updated{" "}
                  {new Date(post.updatedAt).toLocaleString()}
                </div>
                <div>{post.excerpt}</div>
                <div className="row">
                  <button className="btn" onClick={() => editPost(post)}>Edit</button>
                  {post.status !== "published" && (
                    <button className="btn success" disabled={role === "writer"} onClick={() => quickPublish(post.id)}>
                      Quick Publish
                    </button>
                  )}
                  <button className="btn danger" onClick={() => deletePost(post.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === "portal" && (
        <section className="grid cols-2">
          <article className="card panel grid">
            <div className="row">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search published posts..."
              />
              <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                <option value="all">All categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div className="reader-grid">
              {publishedPosts.map((post) => (
                <article key={post.id} className="card reader-card" onClick={() => openPost(post.id)}>
                  <div className="meta-line">{post.category}</div>
                  <h4 style={{ margin: "6px 0" }}>{post.title}</h4>
                  <p style={{ margin: 0, color: "var(--muted)" }}>{post.excerpt}</p>
                  <div className="row" style={{ marginTop: 8 }}>
                    {post.tags.slice(0, 3).map((tag) => (
                      <span className="badge" key={tag}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </article>
              ))}
              {publishedPosts.length === 0 && <small>No published posts yet.</small>}
            </div>
          </article>

          <aside className="card panel">
            {selectedPost ? (
              <>
                <h2 style={{ marginTop: 0 }}>{selectedPost.title}</h2>
                <div className="meta-line">
                  By {selectedPost.authorName} • {selectedPost.analytics.readTimeMinutes} min read • {selectedPost.analytics.views} views
                </div>
                <hr />
                <article
                  className="article"
                  dangerouslySetInnerHTML={{ __html: renderArticle(selectedPost.content) }}
                />
                <div className="row">
                  <button className="btn" onClick={() => likePost(selectedPost.id)}>
                    ❤️ Like ({selectedPost.analytics.likes})
                  </button>
                </div>
              </>
            ) : (
              <small>Select a published post to read.</small>
            )}
          </aside>
        </section>
      )}

      {tab === "analytics" && (
        <section className="grid cols-3">
          <article className="card kpi">
            <h3>{stats.totalViews}</h3>
            <p>Total Views</p>
          </article>
          <article className="card kpi">
            <h3>{stats.totalLikes}</h3>
            <p>Total Likes</p>
          </article>
          <article className="card kpi">
            <h3>{stats.avgSeo}%</h3>
            <p>Average SEO score</p>
          </article>

          <article className="card panel" style={{ gridColumn: "1 / -1" }}>
            <h3 style={{ marginTop: 0 }}>Pipeline</h3>
            <div className="row" style={{ marginBottom: 10 }}>
              <span className="badge status-draft">Drafts: {stats.drafts}</span>
              <span className="badge status-scheduled">Scheduled: {stats.scheduled}</span>
              <span className="badge status-published">Published: {stats.published}</span>
            </div>
            <div className="grid" style={{ gap: 12 }}>
              {posts
                .slice()
                .sort((a, b) => b.analytics.views - a.analytics.views)
                .slice(0, 8)
                .map((post) => {
                  const maxViews = Math.max(1, ...posts.map((p) => p.analytics.views));
                  const width = Math.round((post.analytics.views / maxViews) * 100);
                  return (
                    <div key={post.id}>
                      <div className="meta-line" style={{ marginBottom: 4 }}>
                        {post.title} — {post.analytics.views} views / {post.analytics.likes} likes
                      </div>
                      <div className="progress">
                        <span style={{ width: `${width}%` }} />
                      </div>
                    </div>
                  );
                })}
              {posts.length === 0 && <small>No analytics yet. Publish and read posts to generate data.</small>}
            </div>
          </article>
        </section>
      )}
    </main>
  );
}
