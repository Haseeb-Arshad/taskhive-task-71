(() => {
  'use strict';

  const STORAGE = {
    POSTS: 'bpp_posts_v1',
    DRAFT: 'bpp_draft_v1',
    USER: 'bpp_user_v1'
  };

  const els = {
    form: document.getElementById('editorForm'),
    displayName: document.getElementById('displayName'),
    roleSelect: document.getElementById('roleSelect'),
    title: document.getElementById('title'),
    excerpt: document.getElementById('excerpt'),
    category: document.getElementById('category'),
    tags: document.getElementById('tags'),
    content: document.getElementById('content'),
    focusKeyword: document.getElementById('focusKeyword'),
    slug: document.getElementById('slug'),
    metaDescription: document.getElementById('metaDescription'),
    scheduleAt: document.getElementById('scheduleAt'),
    statusPreview: document.getElementById('statusPreview'),
    seoMeter: document.getElementById('seoMeter'),
    seoScoreText: document.getElementById('seoScoreText'),
    autosaveState: document.getElementById('autosaveState'),
    editorMode: document.getElementById('editorMode'),
    saveDraftBtn: document.getElementById('saveDraftBtn'),
    publishBtn: document.getElementById('publishBtn'),
    resetBtn: document.getElementById('resetBtn'),
    ideaBtn: document.getElementById('ideaBtn'),
    ideaText: document.getElementById('ideaText'),
    searchInput: document.getElementById('searchInput'),
    filterCategory: document.getElementById('filterCategory'),
    filterStatus: document.getElementById('filterStatus'),
    postsContainer: document.getElementById('postsContainer'),
    kpis: document.getElementById('kpis'),
    categoryChart: document.getElementById('categoryChart'),
    tagChart: document.getElementById('tagChart'),
    refreshAnalyticsBtn: document.getElementById('refreshAnalyticsBtn'),
    liveClock: document.getElementById('liveClock')
  };

  const state = {
    posts: [],
    editingPostId: null,
    search: '',
    filterCategory: 'all',
    filterStatus: 'all',
    user: {
      name: 'Guest Writer',
      role: 'writer'
    }
  };

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function toLocalInputValue(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    const offset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - offset).toISOString().slice(0, 16);
  }

  function fromLocalInputValue(v) {
    if (!v) return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  }

  function safeJsonParse(raw, fallback) {
    try {
      return JSON.parse(raw);
    } catch {
      return fallback;
    }
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function slugify(input) {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }

  function getTags(raw) {
    return raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
      .slice(0, 10);
  }

  function loadState() {
    const posts = safeJsonParse(localStorage.getItem(STORAGE.POSTS), []);
    state.posts = Array.isArray(posts) ? posts : [];

    if (state.posts.length === 0) {
      seedData();
    }

    const user = safeJsonParse(localStorage.getItem(STORAGE.USER), null);
    if (user?.name && user?.role) {
      state.user = user;
    }

    els.displayName.value = state.user.name;
    els.roleSelect.value = state.user.role;

    const draft = safeJsonParse(localStorage.getItem(STORAGE.DRAFT), null);
    if (draft && !state.editingPostId) {
      applyFormData(draft, true);
      markAutosave(`restored at ${new Date(draft.savedAt).toLocaleTimeString()}`);
    }
  }

  function persistPosts() {
    localStorage.setItem(STORAGE.POSTS, JSON.stringify(state.posts));
  }

  function persistUser() {
    localStorage.setItem(STORAGE.USER, JSON.stringify(state.user));
  }

  function seedData() {
    const sample = [
      {
        id: uid(),
        title: 'How to Turn Boring Updates Into Addictive Stories',
        excerpt: 'Frameworks that transform routine content into compelling narratives.',
        content: 'Most updates fail because they report facts without emotional structure. Use conflict, turning points, and a clear payoff. Readers remember stories, not bullet points.',
        category: 'Marketing',
        tags: ['storytelling', 'copywriting', 'engagement'],
        focusKeyword: 'storytelling',
        metaDescription: 'Learn to write engaging blog updates using storytelling arcs, tension, and clear takeaways.',
        slug: 'turn-boring-updates-into-addictive-stories',
        status: 'published',
        scheduledAt: null,
        publishedAt: nowIso(),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        authorName: 'Portal Team',
        authorRole: 'editor',
        views: 17,
        seoScore: 87
      },
      {
        id: uid(),
        title: '5 AI Prompts That Rescue You From Writer\'s Block',
        excerpt: 'Prompt patterns for brainstorming hooks, outlines, and examples in minutes.',
        content: 'When you are stuck, ask AI to generate unusual angles, analogy maps, and counterintuitive opinions. Then refine with your voice and real expertise.',
        category: 'AI',
        tags: ['ai', 'writing', 'productivity'],
        focusKeyword: 'AI prompts',
        metaDescription: 'A practical set of AI prompt templates to break writer\'s block and generate better blog ideas quickly.',
        slug: 'ai-prompts-rescue-writers-block',
        status: 'scheduled',
        scheduledAt: new Date(Date.now() + 3600 * 1000).toISOString(),
        publishedAt: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        authorName: 'Portal Team',
        authorRole: 'writer',
        views: 5,
        seoScore: 82
      }
    ];
    state.posts = sample;
    persistPosts();
  }

  function formData() {
    return {
      title: els.title.value.trim(),
      excerpt: els.excerpt.value.trim(),
      category: els.category.value.trim() || 'Technology',
      tags: getTags(els.tags.value),
      content: els.content.value.trim(),
      focusKeyword: els.focusKeyword.value.trim(),
      slug: (els.slug.value.trim() || slugify(els.title.value.trim())).slice(0, 90),
      metaDescription: els.metaDescription.value.trim(),
      scheduledAt: fromLocalInputValue(els.scheduleAt.value)
    };
  }

  function applyFormData(data, isDraft = false) {
    els.title.value = data.title || '';
    els.excerpt.value = data.excerpt || '';
    els.category.value = data.category || 'Technology';
    els.tags.value = Array.isArray(data.tags) ? data.tags.join(', ') : '';
    els.content.value = data.content || '';
    els.focusKeyword.value = data.focusKeyword || '';
    els.slug.value = data.slug || '';
    els.metaDescription.value = data.metaDescription || '';
    els.scheduleAt.value = toLocalInputValue(data.scheduledAt || null);

    if (!isDraft) {
      state.editingPostId = data.id || null;
      els.editorMode.textContent = state.editingPostId
        ? `Mode: Editing #${state.editingPostId.slice(-6)}`
        : 'Mode: Creating new post';
    }
    refreshSeo();
  }

  function scoreSeo(post) {
    let score = 0;
    const titleLen = post.title.length;
    const contentLen = post.content.length;
    const metaLen = post.metaDescription.length;
    const keyword = post.focusKeyword.toLowerCase();
    const title = post.title.toLowerCase();
    const content = post.content.toLowerCase();

    if (titleLen >= 45 && titleLen <= 70) score += 20;
    else if (titleLen >= 25) score += 10;

    if (contentLen > 900) score += 20;
    else if (contentLen > 500) score += 12;
    else if (contentLen > 250) score += 6;

    if (metaLen >= 140 && metaLen <= 160) score += 16;
    else if (metaLen > 80) score += 8;

    if (post.slug && post.slug.includes('-') && post.slug.length >= 8) score += 10;

    if (keyword) {
      if (title.includes(keyword)) score += 12;
      if (content.includes(keyword)) score += 12;
      if (post.metaDescription.toLowerCase().includes(keyword)) score += 6;
    }

    if (post.tags.length >= 2) score += 8;
    if (post.excerpt.length >= 40) score += 6;

    return Math.min(100, score);
  }

  function refreshSeo() {
    const draft = formData();
    const score = scoreSeo(draft);
    els.seoMeter.style.width = `${score}%`;
    els.seoScoreText.textContent = `SEO Score: ${score} / 100`;
    els.statusPreview.value = draft.scheduledAt && new Date(draft.scheduledAt) > new Date() ? 'scheduled' : 'draft';
  }

  function canModifyPost(post) {
    const role = state.user.role;
    const isOwner = post.authorName === state.user.name;
    if (role === 'admin') return true;
    if (role === 'editor') return post.status !== 'published' || isOwner;
    return isOwner;
  }

  function canPublishPost(post) {
    const role = state.user.role;
    const isOwner = post.authorName === state.user.name;
    if (role === 'admin' || role === 'editor') return true;
    return role === 'writer' && isOwner;
  }

  function markAutosave(message) {
    els.autosaveState.textContent = `Autosave: ${message}`;
  }

  function autosaveDraft() {
    const data = formData();
    if (!data.title && !data.content) return;
    const payload = {
      ...data,
      savedAt: nowIso()
    };
    localStorage.setItem(STORAGE.DRAFT, JSON.stringify(payload));
    markAutosave(`saved ${new Date(payload.savedAt).toLocaleTimeString()}`);
  }

  function clearEditor(resetDraftStorage = false) {
    els.form.reset();
    state.editingPostId = null;
    els.editorMode.textContent = 'Mode: Creating new post';
    refreshSeo();
    if (resetDraftStorage) {
      localStorage.removeItem(STORAGE.DRAFT);
      markAutosave('idle');
    }
  }

  function submitPost(wantPublish) {
    const data = formData();
    if (!data.title || !data.content) {
      alert('Title and content are required.');
      return;
    }

    const now = new Date();
    const scheduleDate = data.scheduledAt ? new Date(data.scheduledAt) : null;

    let status = 'draft';
    let publishedAt = null;
    if (wantPublish) {
      if (scheduleDate && scheduleDate > now) {
        status = 'scheduled';
      } else {
        status = 'published';
        publishedAt = nowIso();
      }
    }

    const seoScore = scoreSeo(data);
    const existingIndex = state.posts.findIndex((p) => p.id === state.editingPostId);

    if (existingIndex >= 0) {
      const original = state.posts[existingIndex];
      if (!canModifyPost(original)) {
        alert('Your role cannot modify this post.');
        return;
      }
      if (wantPublish && !canPublishPost(original)) {
        alert('Your role cannot publish this post.');
        return;
      }

      state.posts[existingIndex] = {
        ...original,
        ...data,
        status,
        publishedAt: status === 'published' ? (original.publishedAt || publishedAt) : null,
        updatedAt: nowIso(),
        seoScore
      };
    } else {
      const created = {
        id: uid(),
        ...data,
        status,
        publishedAt,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        authorName: state.user.name,
        authorRole: state.user.role,
        views: 0,
        seoScore
      };
      state.posts.unshift(created);
      state.editingPostId = created.id;
      els.editorMode.textContent = `Mode: Editing #${created.id.slice(-6)}`;
    }

    persistPosts();
    localStorage.removeItem(STORAGE.DRAFT);
    markAutosave('idle');
    renderAll();
  }

  function processScheduled() {
    const now = new Date();
    let changed = false;
    state.posts = state.posts.map((post) => {
      if (post.status === 'scheduled' && post.scheduledAt && new Date(post.scheduledAt) <= now) {
        changed = true;
        return {
          ...post,
          status: 'published',
          publishedAt: nowIso(),
          updatedAt: nowIso()
        };
      }
      return post;
    });

    if (changed) {
      persistPosts();
      renderAll();
    }
  }

  function filteredPosts() {
    const q = state.search.trim().toLowerCase();

    return state.posts
      .filter((p) => {
        const matchesQ =
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.tags.join(' ').toLowerCase().includes(q);
        const matchesCategory = state.filterCategory === 'all' || p.category === state.filterCategory;
        const matchesStatus = state.filterStatus === 'all' || p.status === state.filterStatus;
        return matchesQ && matchesCategory && matchesStatus;
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  function renderPosts() {
    const list = filteredPosts();

    if (list.length === 0) {
      els.postsContainer.innerHTML = '<div class="post-card">No posts found with current filters.</div>';
      return;
    }

    els.postsContainer.innerHTML = list
      .map((p) => {
        const canEdit = canModifyPost(p);
        const canDelete = state.user.role === 'admin' || (state.user.role === 'editor' && p.status !== 'published') || (state.user.role === 'writer' && p.authorName === state.user.name && p.status !== 'published');
        const scheduleText = p.status === 'scheduled' && p.scheduledAt ? ` • Goes live: ${new Date(p.scheduledAt).toLocaleString()}` : '';

        return `
          <article class="post-card" data-id="${p.id}">
            <div class="post-head">
              <div>
                <h3 class="post-title">${escapeHtml(p.title)}</h3>
                <div class="post-meta">By ${escapeHtml(p.authorName)} (${escapeHtml(p.authorRole)}) • ${new Date(p.updatedAt).toLocaleString()}${scheduleText}</div>
              </div>
              <span class="badge ${p.status}">${p.status}</span>
            </div>

            <p class="post-excerpt">${escapeHtml(p.excerpt || p.content.slice(0, 130))}</p>

            <div class="tags">${p.tags.map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`).join('')}</div>

            <div class="post-meta">Category: ${escapeHtml(p.category)} • SEO: ${p.seoScore || 0} • Views: ${p.views || 0}</div>

            <div class="post-actions">
              <button class="btn btn-ghost" data-action="view">View</button>
              <button class="btn btn-ghost" data-action="duplicate">Duplicate</button>
              <button class="btn btn-ghost" data-action="edit" ${canEdit ? '' : 'disabled'}>Edit</button>
              <button class="btn btn-ghost" data-action="delete" ${canDelete ? '' : 'disabled'}>Delete</button>
            </div>
          </article>
        `;
      })
      .join('');
  }

  function renderFilters() {
    const categories = Array.from(new Set(state.posts.map((p) => p.category))).sort((a, b) => a.localeCompare(b));
    els.filterCategory.innerHTML = `<option value="all">All Categories</option>${categories
      .map((c) => `<option value="${escapeHtml(c)}">${escapeHtml(c)}</option>`)
      .join('')}`;
    els.filterCategory.value = state.filterCategory;
  }

  function renderAnalytics() {
    const total = state.posts.length;
    const published = state.posts.filter((p) => p.status === 'published').length;
    const scheduled = state.posts.filter((p) => p.status === 'scheduled').length;
    const drafts = state.posts.filter((p) => p.status === 'draft').length;
    const avgSeo = total ? Math.round(state.posts.reduce((sum, p) => sum + (p.seoScore || 0), 0) / total) : 0;

    els.kpis.innerHTML = [
      ['Total Posts', total],
      ['Published', published],
      ['Scheduled', scheduled],
      ['Drafts', drafts],
      ['Avg SEO', avgSeo]
    ]
      .map(
        ([label, value]) =>
          `<div class="kpi"><div class="kpi-label">${label}</div><div class="kpi-value">${value}</div></div>`
      )
      .join('');

    const categoryCounts = countBy(state.posts.map((p) => p.category));
    const tagCounts = countBy(state.posts.flatMap((p) => p.tags));

    renderBars(els.categoryChart, categoryCounts, 6);
    renderBars(els.tagChart, tagCounts, 6);
  }

  function countBy(items) {
    return items.reduce((acc, item) => {
      if (!item) return acc;
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
  }

  function renderBars(container, map, maxItems) {
    const entries = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxItems);

    if (entries.length === 0) {
      container.innerHTML = '<div class="post-meta">No data yet.</div>';
      return;
    }

    const max = entries[0][1] || 1;
    container.innerHTML = entries
      .map(([label, value]) => {
        const pct = Math.round((value / max) * 100);
        return `
          <div class="bar-row">
            <div class="bar-label"><span>${escapeHtml(label)}</span><span>${value}</span></div>
            <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
          </div>
        `;
      })
      .join('');
  }

  function updateClock() {
    els.liveClock.textContent = new Date().toLocaleString();
  }

  function randomIdea() {
    const ideas = [
      'Write: “The Day Our Content Calendar Failed — and Why It Saved Us.”',
      'Create a “myth vs reality” post about AI in everyday workflows.',
      'Do a tactical list: 7 hooks that make readers stop scrolling.',
      'Tell a behind-the-scenes story of publishing mistakes and lessons.',
      'Make a case study: 30-day SEO sprint from 0 to first organic leads.'
    ];
    const idea = ideas[Math.floor(Math.random() * ideas.length)];
    els.ideaText.textContent = idea;
  }

  function handlePostAction(event) {
    const button = event.target.closest('button[data-action]');
    if (!button) return;

    const card = event.target.closest('.post-card');
    if (!card) return;

    const id = card.getAttribute('data-id');
    const post = state.posts.find((p) => p.id === id);
    if (!post) return;

    const action = button.getAttribute('data-action');

    if (action === 'view') {
      post.views = (post.views || 0) + 1;
      persistPosts();
      alert(`${post.title}\n\n${post.content.slice(0, 1200)}${post.content.length > 1200 ? '...' : ''}`);
      renderAll();
      return;
    }

    if (action === 'duplicate') {
      const clone = {
        ...post,
        id: uid(),
        title: `${post.title} (Copy)`,
        status: 'draft',
        publishedAt: null,
        scheduledAt: null,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        authorName: state.user.name,
        authorRole: state.user.role,
        views: 0
      };
      state.posts.unshift(clone);
      persistPosts();
      renderAll();
      return;
    }

    if (action === 'edit') {
      if (!canModifyPost(post)) {
        alert('You are not allowed to edit this post.');
        return;
      }
      applyFormData(post);
      return;
    }

    if (action === 'delete') {
      if (!confirm(`Delete "${post.title}"? This action cannot be undone.`)) return;
      state.posts = state.posts.filter((p) => p.id !== id);
      if (state.editingPostId === id) {
        clearEditor(true);
      }
      persistPosts();
      renderAll();
    }
  }

  function renderAll() {
    renderFilters();
    renderPosts();
    renderAnalytics();
    refreshSeo();
  }

  function bindEvents() {
    ['input', 'change'].forEach((evtName) => {
      els.form.addEventListener(evtName, () => {
        if (!els.slug.value.trim() && els.title.value.trim()) {
          els.slug.value = slugify(els.title.value.trim());
        }
        refreshSeo();
      });
    });

    els.form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitPost(true);
    });

    els.saveDraftBtn.addEventListener('click', () => submitPost(false));
    els.resetBtn.addEventListener('click', () => clearEditor(false));

    els.searchInput.addEventListener('input', (e) => {
      state.search = e.target.value;
      renderPosts();
    });

    els.filterCategory.addEventListener('change', (e) => {
      state.filterCategory = e.target.value;
      renderPosts();
    });

    els.filterStatus.addEventListener('change', (e) => {
      state.filterStatus = e.target.value;
      renderPosts();
    });

    els.postsContainer.addEventListener('click', handlePostAction);

    els.roleSelect.addEventListener('change', (e) => {
      state.user.role = e.target.value;
      persistUser();
      renderAll();
    });

    els.displayName.addEventListener('input', (e) => {
      state.user.name = e.target.value.trim() || 'Guest Writer';
      persistUser();
    });

    els.ideaBtn.addEventListener('click', randomIdea);
    els.refreshAnalyticsBtn.addEventListener('click', renderAnalytics);

    setInterval(autosaveDraft, 6000);
    setInterval(processScheduled, 30000);
    setInterval(updateClock, 1000);
  }

  function init() {
    loadState();
    bindEvents();
    updateClock();
    randomIdea();
    renderAll();
  }

  init();
})();
