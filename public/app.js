const state = {
  articles: [],
  cachedArticles: loadCachedArticles(),
  activeArticle: null,
  selectedText: "",
  selectionContext: "",
  vocab: loadVocab(),
  bookmarks: loadBookmarks(),
  showBookmarkedOnly: false,
  readIds: loadReadIds(),
  showDailyPicks: false,
  readFilter: "all",
  paragraphTexts: [],
  paragraphTranslations: new Map()
};

const els = {
  levelSelect: document.querySelector("#levelSelect"),
  typeSelect: document.querySelector("#typeSelect"),
  categorySelect: document.querySelector("#categorySelect"),
  minWordsSelect: document.querySelector("#minWordsSelect"),
  collectButton: document.querySelector("#collectButton"),
  dailyPicksButton: document.querySelector("#dailyPicksButton"),
  exportButton: document.querySelector("#exportButton"),
  searchInput: document.querySelector("#searchInput"),
  articleCount: document.querySelector("#articleCount"),
  articleList: document.querySelector("#articleList"),
  readTabs: document.querySelector("#readTabs"),
  unreadBadge: document.querySelector("#unreadBadge"),
  readerSource: document.querySelector("#readerSource"),
  readerTitle: document.querySelector("#readerTitle"),
  readerLevel: document.querySelector("#readerLevel"),
  readerScore: document.querySelector("#readerScore"),
  readerText: document.querySelector("#readerText"),
  popup: document.querySelector("#translationPopup"),
  popupWord: document.querySelector("#popupWord"),
  popupMeaning: document.querySelector("#popupMeaning"),
  popupSource: document.querySelector("#popupSource"),
  popupNote: document.querySelector("#popupNote"),
  saveWordButton: document.querySelector("#saveWordButton"),
  closePopupButton: document.querySelector("#closePopupButton"),
  wordCount: document.querySelector("#wordCount"),
  vocabList: document.querySelector("#vocabList"),
  clearKnownButton: document.querySelector("#clearKnownButton"),
  bookmarkToggle: document.querySelector("#bookmarkToggle")
};

/* ---- persistence ---- */

function loadVocab() {
  try { return JSON.parse(localStorage.getItem("englishst:vocab") || "[]"); } catch { return []; }
}

function saveVocab() {
  localStorage.setItem("englishst:vocab", JSON.stringify(state.vocab));
}

function loadBookmarks() {
  try { return JSON.parse(localStorage.getItem("englishst:bookmarks") || "[]"); } catch { return []; }
}

function saveBookmarks() {
  localStorage.setItem("englishst:bookmarks", JSON.stringify(state.bookmarks));
}

function loadCachedArticles() {
  try {
    const cached = JSON.parse(localStorage.getItem("englishst:articles") || "null");
    if (cached && Array.isArray(cached.articles) && cached.articles.length) {
      return cached.articles;
    }
    return [];
  } catch { return []; }
}

function saveCachedArticles() {
  localStorage.setItem("englishst:articles", JSON.stringify({
    articles: state.cachedArticles,
    updatedAt: new Date().toISOString()
  }));
}

function loadReadIds() {
  try {
    const ids = JSON.parse(localStorage.getItem("englishst:readIds") || "[]");
    return new Set(ids);
  } catch { return new Set(); }
}

function saveReadIds() {
  localStorage.setItem("englishst:readIds", JSON.stringify([...state.readIds]));
}

/* ---- helpers ---- */

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeWord(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/^[^a-z]+|[^a-z]+$/g, "")
    .trim();
}

function getKnownWords() {
  return new Set(state.vocab.map((entry) => normalizeWord(entry.text)).filter(Boolean));
}

function isBookmarked(articleId) {
  return state.bookmarks.some((b) => b.id === articleId);
}

function isRead(articleId) {
  return state.readIds.has(articleId);
}

function countUnread() {
  return state.cachedArticles.filter((a) => !isRead(a.id)).length;
}

function categoryLabel(category) {
  const labels = {
    politics: "政治",
    finance: "财经",
    technology: "科技",
    science: "科学",
    health: "健康",
    education: "教育",
    environment: "环境",
    culture: "文化",
    general: "综合"
  };
  return labels[category] || "综合";
}

/* ---- bookmark ---- */

function toggleBookmark(article) {
  if (!article) return;
  const index = state.bookmarks.findIndex((b) => b.id === article.id);
  if (index >= 0) {
    state.bookmarks.splice(index, 1);
  } else {
    state.bookmarks.unshift({ ...article, bookmarkedAt: new Date().toISOString() });
  }
  saveBookmarks();
  applyFilters();
}

/* ---- read tracking ---- */

function markAsRead(articleId) {
  if (!articleId || state.readIds.has(articleId)) return;
  state.readIds.add(articleId);
  saveReadIds();
}

/* ---- daily picks ---- */

function computeDailyPicks() {
  const today = new Date().toISOString().slice(0, 10);
  const stored = (() => {
    try {
      const raw = localStorage.getItem("englishst:dailyPicks");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed.date === today ? parsed : null;
    } catch { return null; }
  })();

  if (stored) return stored.ids;

  const all = [...state.cachedArticles];
  if (!all.length) return [];

  const picked = [];
  const sourceCount = new Map();
  const sorted = [...all].sort((a, b) => {
    const dist = Math.abs((a.score || 60) - 68) - Math.abs((b.score || 60) - 68);
    if (dist !== 0) return dist;
    return (b.wordCount || 0) - (a.wordCount || 0);
  });

  for (const article of sorted) {
    const src = article.source || "";
    const used = sourceCount.get(src) || 0;
    if (used >= 2) continue;
    sourceCount.set(src, used + 1);
    picked.push(article.id);
    if (picked.length >= 10) break;
  }

  localStorage.setItem("englishst:dailyPicks", JSON.stringify({ date: today, ids: picked }));
  return picked;
}

/* ---- client-side filter pipeline ---- */

function targetRange(target) {
  const n = String(target || "CET6").toUpperCase();
  if (n.includes("IELTS") || n === "C1") return [68, 86];
  if (n.includes("CET6") || n === "B2") return [58, 76];
  return [48, 68];
}

function distanceFromTarget(score, target) {
  const [min, max] = targetRange(target);
  if (score >= min && score <= max) return 0;
  return Math.min(Math.abs(score - min), Math.abs(score - max));
}

function applyFilters() {
  let source = [...state.cachedArticles];

  if (state.showDailyPicks) {
    const pickIds = new Set(computeDailyPicks());
    source = source.filter((a) => pickIds.has(a.id));
  }

  const type = els.typeSelect.value;
  if (type !== "all") {
    source = source.filter((a) => a.type === type);
  }

  const minWords = Number(els.minWordsSelect.value) || 300;
  source = source.filter((a) => (a.wordCount || 0) >= minWords);

  const category = els.categorySelect.value;
  if (category !== "all") {
    source = source.filter((a) => {
      const categories = Array.isArray(a.categories) ? a.categories : [a.category || "general"];
      return categories.includes(category);
    });
  }

  const target = els.levelSelect.value;
  source.sort((a, b) => distanceFromTarget(a.score, target) - distanceFromTarget(b.score, target));

  if (state.showBookmarkedOnly) {
    const bookmarkedIds = new Set(state.bookmarks.map((b) => b.id));
    source = source.filter((a) => bookmarkedIds.has(a.id));
    const loadedIds = new Set(source.map((a) => a.id));
    for (const bm of state.bookmarks) {
      if (!loadedIds.has(bm.id)) source.push(bm);
    }
  }

  if (state.readFilter === "unread") {
    source = source.filter((a) => !isRead(a.id));
  } else if (state.readFilter === "read") {
    source = source.filter((a) => isRead(a.id));
  }

  const query = els.searchInput.value.trim().toLowerCase();
  if (query) {
    source = source.filter((a) => {
      const hay = `${a.title} ${a.source} ${a.text}`.toLowerCase();
      return hay.includes(query);
    });
  }

  state.articles = source;
  renderArticles();
  renderReadTabs();
}

/* ---- rendering ---- */

function splitIntoSentences(text) {
  const raw = String(text || "");
  const matches = raw.match(/[^.!?]+[.!?]+[\s"'»)\]]*/g);
  if (!matches || matches.length === 0) return [raw];
  return matches.map((s) => s.trim()).filter(Boolean);
}

function renderArticleText(text) {
  const known = getKnownWords();
  const sentences = splitIntoSentences(text);
  const groupSize = Math.max(2, Math.round(sentences.length / 6));
  const paragraphs = [];

  for (let i = 0; i < sentences.length; i += groupSize) {
    paragraphs.push(sentences.slice(i, i + groupSize).join(" "));
  }

  if (!paragraphs.length) {
    paragraphs.push(String(text || ""));
  }

  state.paragraphTexts = paragraphs;

  return paragraphs
    .map((p, index) => {
      const escaped = escapeHtml(p);
      const highlighted = escaped.replace(/\b[A-Za-z][A-Za-z'-]*\b/g, (word) => {
        return known.has(normalizeWord(word))
          ? `<span class="known-word">${word}</span>`
          : word;
      });
      const translation = state.paragraphTranslations.get(index);
      return `
        <section class="reader-paragraph" data-paragraph="${index}">
          <button class="paragraph-translate-btn" data-translate-paragraph="${index}" title="翻译整段">译</button>
          <p>${highlighted}</p>
          ${
            translation
              ? `<div class="paragraph-translation">
                  <div>${escapeHtml(translation.meaning)}</div>
                  <span>${escapeHtml(translation.source ? `翻译来源：${translation.source}` : "")}</span>
                </div>`
              : ""
          }
        </section>
      `;
    })
    .join("");
}

function renderArticles() {
  els.articleCount.textContent = String(state.articles.length);
  els.bookmarkToggle.classList.toggle("active", state.showBookmarkedOnly);
  els.dailyPicksButton.classList.toggle("active", state.showDailyPicks);

  els.articleList.innerHTML = state.articles.length
    ? state.articles
        .map((article) => {
          const bookmarked = isBookmarked(article.id);
          const read = isRead(article.id);
          return `
            <div class="article-item-wrapper">
              <button class="article-item ${read ? "read" : ""} ${
                state.activeArticle?.id === article.id ? "active" : ""
              }" data-id="${escapeHtml(article.id)}">
                <span class="article-title">
                  ${!read ? `<span class="unread-dot"></span>` : ""}${escapeHtml(article.title)}
                </span>
                <span class="article-meta">来源：${escapeHtml(article.source || "Unknown source")}</span>
                <span class="tag-row">
                  <span class="tag ${article.type}">${article.type === "news" ? "新闻" : "小说"}</span>
                  <span class="tag">${categoryLabel(article.category)}</span>
                  <span class="tag">${escapeHtml(article.level)} · ${article.score}</span>
                  <span class="tag">${article.wordCount || 0} 词</span>
                </span>
              </button>
              <button class="bookmark-btn ${
                bookmarked ? "bookmarked" : ""
              }" data-bookmark-id="${escapeHtml(article.id)}" title="${bookmarked ? "取消收藏" : "收藏文章"}">
                ${bookmarked ? "★" : "☆"}
              </button>
            </div>
          `;
        })
        .join("")
    : `<div class="empty-state">${
        state.cachedArticles.length
          ? "当前筛选条件下没有匹配文章。"
          : "点击「收集文章」建立本地资料库。"
      }</div>`;
}

function renderReadTabs() {
  const unread = countUnread();
  els.unreadBadge.textContent = String(unread);
  els.readTabs.querySelectorAll(".read-tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.filter === state.readFilter);
  });
}

function renderReader(article) {
  if (!article) return;
  state.activeArticle = article;
  markAsRead(article.id);

  const sourceText = `${article.source || "Unknown source"}${
    article.publishedAt ? " · " + article.publishedAt : ""
  } · ${article.wordCount || 0} 词`;
  els.readerSource.innerHTML = article.url
    ? `来源：<a href="${escapeHtml(article.url)}" target="_blank" rel="noreferrer">${escapeHtml(
        sourceText
      )}</a>`
    : `来源：${escapeHtml(sourceText)}`;
  els.readerTitle.textContent = article.title;
  els.readerLevel.textContent = `${article.level} · ${article.score}`;
  els.readerScore.value = article.score;
  state.paragraphTranslations = new Map();
  els.readerText.innerHTML = renderArticleText(article.text);
  hidePopup();
  applyFilters();
}

function renderVocab() {
  els.wordCount.textContent = String(state.vocab.length);
  if (!state.vocab.length) {
    els.vocabList.innerHTML = `<div class="empty-state">暂无生词记录。</div>`;
    return;
  }

  els.vocabList.innerHTML = state.vocab
    .map(
      (entry) => `
        <div class="vocab-item">
          <div class="vocab-word">
            <span>${escapeHtml(entry.text)}</span>
            <button data-remove="${escapeHtml(entry.id)}" title="移除">×</button>
          </div>
          <div class="vocab-meaning">${escapeHtml(entry.meaning)}</div>
          ${
            entry.note
              ? `<div class="vocab-meta">笔记：${escapeHtml(entry.note)}</div>`
              : ""
          }
          <div class="vocab-meta">${escapeHtml(entry.articleTitle || "")}</div>
        </div>
      `
    )
    .join("");
}

/* ---- server interaction ---- */

async function collectArticles() {
  els.collectButton.disabled = true;
  els.collectButton.textContent = "收集中...";
  const type = "all";
  const level = els.levelSelect.value;
  const minWords = "300";

  try {
    const response = await fetch(
      `/api/library?type=${encodeURIComponent(type)}&level=${encodeURIComponent(level)}&minWords=${minWords}`
    );
    const payload = await response.json();
    state.cachedArticles = payload.articles || [];
    saveCachedArticles();
    state.showDailyPicks = false;
    els.collectButton.textContent = `新增 ${payload.added || 0} 篇 · 入库 ${payload.total || state.cachedArticles.length} 篇`;
    setTimeout(() => {
      els.collectButton.innerHTML = `<span aria-hidden="true">↻</span> 收集文章`;
    }, 1800);
    applyFilters();
    if (state.articles[0]) renderReader(state.articles[0]);
  } catch {
    if (!state.cachedArticles.length) {
      els.articleList.innerHTML = `<div class="empty-state">收集失败。请确认本地服务仍在运行。</div>`;
    }
    els.collectButton.innerHTML = `<span aria-hidden="true">↻</span> 收集文章`;
  } finally {
    els.collectButton.disabled = false;
  }
}

async function loadStoredLibrary() {
  try {
    const response = await fetch("/api/library?mode=stored");
    const payload = await response.json();
    if (!Array.isArray(payload.articles)) return;
    state.cachedArticles = payload.articles;
    saveCachedArticles();
    applyFilters();
    if (!state.activeArticle && state.articles[0]) renderReader(state.articles[0]);
  } catch {
    if (!state.cachedArticles.length) {
      els.articleList.innerHTML = `<div class="empty-state">本地资料库暂时无法读取。</div>`;
    }
  }
}

/* ---- translation ---- */

function sentenceAroundSelection(selection) {
  const anchor = selection.anchorNode?.textContent || "";
  const selected = selection.toString();
  if (!anchor || !selected) return "";
  const index = anchor.indexOf(selected);
  if (index < 0) return anchor.slice(0, 220);
  const before = anchor.slice(0, index).lastIndexOf(".");
  const afterRaw = anchor.slice(index + selected.length).search(/[.!?]/);
  const start = before >= 0 ? before + 1 : 0;
  const end = afterRaw >= 0 ? index + selected.length + afterRaw + 1 : anchor.length;
  return anchor.slice(start, end).trim();
}

async function showPopupForSelection(event) {
  if (event.target.closest("[data-translate-paragraph]")) return;
  const selection = window.getSelection();
  const text = selection?.toString().trim().replace(/\s+/g, " ");
  if (!text || text.length > 80 || !els.readerText.contains(selection.anchorNode)) return;

  state.selectedText = text;
  state.selectionContext = sentenceAroundSelection(selection);
  els.popupWord.textContent = text;
  els.popupMeaning.textContent = "查询中...";
  els.popupSource.textContent = "";
  els.popupNote.value = "";
  els.popup.hidden = false;

  const x = Math.min(event.clientX + 12, window.innerWidth - 344);
  const y = Math.min(event.clientY + 12, window.innerHeight - 230);
  els.popup.style.left = `${Math.max(12, x)}px`;
  els.popup.style.top = `${Math.max(12, y)}px`;

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, context: state.selectionContext })
    });
    const payload = await response.json();
    els.popupMeaning.textContent = payload.meaning;
    els.popupSource.textContent = payload.source ? `翻译来源：${payload.source}` : "";
  } catch {
    els.popupMeaning.textContent = "查询失败，可手动填写释义后保存。";
    els.popupSource.textContent = "";
  }
}

function hidePopup() {
  els.popup.hidden = true;
}

async function translateParagraph(index, button) {
  const text = state.paragraphTexts[index];
  if (!text) return;

  button.disabled = true;
  const originalText = button.textContent;
  button.textContent = "...";

  try {
    const response = await fetch("/api/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, context: text, mode: "paragraph" })
    });
    const payload = await response.json();
    state.paragraphTranslations.set(index, {
      meaning: payload.meaning,
      source: payload.source
    });
  } catch {
    state.paragraphTranslations.set(index, {
      meaning: "整段翻译失败，请稍后重试。",
      source: ""
    });
  } finally {
    if (state.activeArticle) {
      els.readerText.innerHTML = renderArticleText(state.activeArticle.text);
    }
    button.disabled = false;
    button.textContent = originalText;
  }
}

function saveSelectedWord() {
  const text = state.selectedText.trim();
  if (!text) return;
  const existing = state.vocab.find((entry) => normalizeWord(entry.text) === normalizeWord(text));
  const note = els.popupNote.value.trim();
  const meaning = note || els.popupMeaning.textContent.trim();

  if (existing) {
    existing.meaning = meaning || existing.meaning;
    existing.note = note || existing.note;
    existing.updatedAt = new Date().toISOString();
  } else {
    state.vocab.unshift({
      id: crypto.randomUUID(),
      text,
      meaning,
      note,
      context: state.selectionContext,
      articleTitle: state.activeArticle?.title || "",
      source: state.activeArticle?.source || "",
      url: state.activeArticle?.url || "",
      createdAt: new Date().toISOString()
    });
  }

  saveVocab();
  renderVocab();
  if (state.activeArticle) els.readerText.innerHTML = renderArticleText(state.activeArticle.text);
  hidePopup();
}

function csvCell(value) {
  return `"${String(value || "").replace(/"/g, '""')}"`;
}

function exportVocab() {
  const header = ["Front", "Back", "Context", "Source", "URL"];
  const rows = state.vocab.map((entry) => [
    entry.text,
    entry.meaning,
    entry.context,
    entry.articleTitle || entry.source,
    entry.url
  ]);
  const csv = [header, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `englishst-vocab-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

/* ---- event listeners ---- */

els.collectButton.addEventListener("click", collectArticles);
els.levelSelect.addEventListener("change", applyFilters);
els.typeSelect.addEventListener("change", applyFilters);
els.categorySelect.addEventListener("change", applyFilters);
els.minWordsSelect.addEventListener("change", applyFilters);
els.searchInput.addEventListener("input", applyFilters);

els.dailyPicksButton.addEventListener("click", () => {
  state.showDailyPicks = !state.showDailyPicks;
  applyFilters();
});

els.readTabs.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-filter]");
  if (!tab) return;
  state.readFilter = tab.dataset.filter;
  applyFilters();
});

els.articleList.addEventListener("click", (event) => {
  const bookmarkBtn = event.target.closest("[data-bookmark-id]");
  if (bookmarkBtn) {
    event.stopPropagation();
    const id = bookmarkBtn.dataset.bookmarkId;
    const article =
      state.cachedArticles.find((a) => a.id === id) ||
      state.bookmarks.find((b) => b.id === id);
    toggleBookmark(article);
    return;
  }

  const button = event.target.closest("[data-id]");
  if (!button) return;
  const article =
    state.cachedArticles.find((item) => item.id === button.dataset.id) ||
    state.bookmarks.find((item) => item.id === button.dataset.id);
  renderReader(article);
});

els.readerText.addEventListener("mouseup", showPopupForSelection);
els.readerText.addEventListener("click", (event) => {
  const button = event.target.closest("[data-translate-paragraph]");
  if (!button) return;
  event.stopPropagation();
  hidePopup();
  translateParagraph(Number(button.dataset.translateParagraph), button);
});
els.saveWordButton.addEventListener("click", saveSelectedWord);
els.closePopupButton.addEventListener("click", hidePopup);
els.exportButton.addEventListener("click", exportVocab);

els.bookmarkToggle.addEventListener("click", () => {
  state.showBookmarkedOnly = !state.showBookmarkedOnly;
  applyFilters();
});

els.clearKnownButton.addEventListener("click", () => {
  if (!state.vocab.length || !confirm("确认清空本地生词本？")) return;
  state.vocab = [];
  saveVocab();
  renderVocab();
  if (state.activeArticle) els.readerText.innerHTML = renderArticleText(state.activeArticle.text);
});

els.vocabList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;
  state.vocab = state.vocab.filter((entry) => entry.id !== button.dataset.remove);
  saveVocab();
  renderVocab();
  if (state.activeArticle) els.readerText.innerHTML = renderArticleText(state.activeArticle.text);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hidePopup();
});

document.addEventListener("pointerdown", (event) => {
  if (els.popup.hidden || els.popup.contains(event.target)) return;
  hidePopup();
});

/* ---- init ---- */

renderVocab();

if (state.cachedArticles.length) {
  state.showDailyPicks = true;
  applyFilters();
  if (state.articles[0]) renderReader(state.articles[0]);
} else {
  els.articleList.innerHTML = `<div class="empty-state">点击「收集文章」建立本地资料库。</div>`;
  els.collectButton.innerHTML = `<span aria-hidden="true">↻</span> 收集文章`;
}

loadStoredLibrary();
