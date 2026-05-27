import http from "node:http";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const dataDir = path.join(__dirname, "data");
const libraryPath = path.join(dataDir, "articles.json");
const port = Number(globalThis.process?.env?.PORT || 5183);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon"
};

const fallbackArticles = [
  {
    id: "news-climate-adaptation",
    type: "news",
    title: "Cities Test New Ways to Adapt to Extreme Heat",
    source: "Learning sample",
    url: "",
    level: "B2",
    score: 63,
    publishedAt: "2026-05-01",
    summary:
      "A news-style article about urban planning, public health, and climate adaptation.",
    text:
      "As summers become hotter, many cities are redesigning public spaces to protect residents from extreme heat. Officials are planting more trees, painting roofs with reflective materials, and opening cooling centers in schools and libraries. Public health researchers say these measures can reduce hospital visits during heat waves, especially among older adults and outdoor workers. However, the benefits are not distributed equally. Wealthier neighborhoods often have more shade and better access to parks, while low-income communities may face higher temperatures and fewer public services. City planners now argue that climate adaptation must include social equity, not only engineering. The most effective projects combine data, local knowledge, and long-term funding. In one pilot program, volunteers walked through several districts with handheld temperature sensors and compared their readings with satellite maps. The results showed that a street with mature trees could be several degrees cooler than a nearby road covered almost entirely by concrete. Local residents then used the findings to request bus shelters, drinking fountains, and safer evening opening hours for public buildings. The process also changed how officials discussed risk. Instead of treating heat as a temporary emergency, they began to treat it as a predictable condition that should influence housing, transport, school schedules, and labor policy. Researchers caution that no single measure will solve the problem. Reflective paint can reduce indoor temperatures, but it does not create public space. Trees provide shade, but they need years of maintenance before they transform a neighborhood. Cooling centers can save lives, but only if people know where they are and can reach them easily. For that reason, the strongest adaptation plans are usually ordinary-looking combinations of many small decisions. They are less dramatic than a new seawall or a major power station, but they shape daily life in ways that residents can immediately feel."
  },
  {
    id: "news-university-ai-policy",
    type: "news",
    title: "Universities Revise Assessment Rules as AI Tools Spread",
    source: "Learning sample",
    url: "",
    level: "C1",
    score: 74,
    publishedAt: "2026-04-20",
    summary:
      "A higher-level article on academic integrity, assessment design, and technology policy.",
    text:
      "Universities are revising assessment policies as generative artificial intelligence becomes a routine part of academic work. Instead of banning every tool, some departments are asking students to disclose how they used software during research, drafting, and revision. Supporters say transparent disclosure can teach responsible practice while preserving academic standards. Critics worry that vague rules may increase inequality because confident students can negotiate boundaries more easily than cautious students. The debate has also encouraged lecturers to redesign assignments. More courses now require oral defense, process notes, annotated bibliographies, or in-class analysis. These changes reflect a broader question: education must assess not only the final essay, but also the intellectual decisions that produced it. At several institutions, instructors are experimenting with staged assignments in which students submit a research question, a source map, an outline, a first paragraph, and a short reflection before the final paper. The approach is not simply a way to detect misconduct. It gives teachers more evidence of how students define a problem, select material, revise claims, and respond to criticism. Students who use AI tools must explain what the tool contributed and where they rejected its suggestions. That requirement can make the learning process more visible, but it also demands careful guidance. A disclosure rule without examples may leave students uncertain about whether grammar correction, translation support, brainstorming, or summarization should be reported. Some universities are therefore writing course-level policies rather than relying only on central rules. A philosophy seminar may emphasize argument and interpretation, while an engineering course may allow code assistance under strict documentation. The common principle is that assessment should protect meaningful intellectual work. If technology changes the surface of writing, universities have to become clearer about what they are actually trying to evaluate."
  },
  {
    id: "lit-austen-sample",
    type: "literature",
    title: "A Social Observation in a Country House",
    source: "Public-domain style sample",
    url: "",
    level: "B2",
    score: 67,
    publishedAt: "1810s",
    summary:
      "A literature-style passage for reading tone, implication, and social vocabulary.",
    text:
      "The morning had been arranged with more care than anyone in the room wished to admit. Mrs. Ellison spoke of the weather, the garden, and the unfortunate delay of the carriage, but her eyes returned again and again to the unopened letter on the table. Her daughter, who understood every silence in the house, continued her embroidery with remarkable attention. It was impossible to say whether Mr. Harcourt noticed the tension or merely enjoyed it. He praised the tea, regretted the clouds, and asked whether the family expected visitors. At this question, Mrs. Ellison smiled with such determination that the answer became less convincing than silence. The room itself seemed to participate in the family's restraint. The clock ticked with unnecessary confidence, the fire burned too brightly for so mild a day, and the roses in the blue vase had begun to drop their petals upon the polished table. Clara Ellison would later remember these details with an irritation she could not quite justify, for nothing important had yet happened. The letter had not been opened; the carriage had not arrived; Mr. Harcourt had not declared any intention beyond the harmless wish for another cup of tea. Yet the whole morning appeared to lean toward some decision. Mrs. Ellison, who possessed the talent of turning anxiety into hospitality, offered cakes to everyone and comfort to no one. Her husband remained in the library under the protection of a newspaper. Clara envied him until she considered that he might know more than he chose to say. When the sound of wheels finally came from the lane, every person in the room behaved as though the noise belonged to someone else. Only Mr. Harcourt rose. He crossed to the window, looked out with leisurely interest, and said that the visitors seemed to be in a hurry."
  },
  {
    id: "lit-academic-narrative",
    type: "literature",
    title: "The Researcher's Notebook",
    source: "Original learning sample",
    url: "",
    level: "C1",
    score: 78,
    publishedAt: "2026",
    summary:
      "A narrative passage with academic vocabulary and complex sentence structure.",
    text:
      "Mara had believed that evidence would make disagreement less personal. The archive taught her otherwise. Each document seemed precise, almost obedient, until it was placed beside another record that contradicted it. Dates shifted, motives became uncertain, and confident explanations began to look like elegant forms of impatience. Her supervisor called this process interpretation, but Mara privately thought of it as humility under pressure. By midnight, surrounded by photocopies and cooling coffee, she understood that scholarship did not remove ambiguity. It trained the mind to remain honest while moving through it. The project had begun with a simple question about how a small coastal town responded to a failed railway proposal in the nineteenth century. Local newspapers described public meetings, commercial optimism, and the promise of faster travel. Private letters told a different story: farmers worried about losing land, merchants argued over compensation, and one schoolteacher complained that every conversation in town had become an argument about the future. Mara tried to arrange these materials into a clean narrative, but the archive resisted her. A petition that looked spontaneous had been drafted by a lawyer. A speech praised in the newspaper appeared, in a diary, as a performance delivered to a half-empty hall. Even the map she had trusted turned out to have been revised after the proposal collapsed. None of these discoveries destroyed the argument she hoped to make, but each one demanded a narrower claim and a more careful sentence. That was the discipline she had not expected. Research did not reward the loudest conclusion. It rewarded the patience to notice when the evidence asked for a smaller, truer one."
  }
];

const glossary = {
  academic: "学术的；学院的",
  adapt: "适应；调整",
  adaptation: "适应；改造；改编",
  ambiguity: "模糊性；多义性；不确定",
  annotated: "带注释的",
  archive: "档案；档案馆",
  argument: "论点；争论",
  artificial: "人工的；人为的",
  assessment: "评估；考核",
  bibliography: "参考书目；文献目录",
  boundary: "边界；界限",
  cautious: "谨慎的",
  climate: "气候",
  combine: "结合；组合",
  confident: "自信的；确信的",
  convincing: "令人信服的",
  contradict: "反驳；相矛盾",
  critic: "批评者；评论家",
  disclose: "披露；公开",
  disclosure: "披露；公开说明",
  distribute: "分配；分布",
  draft: "草稿；起草",
  elegant: "优雅的；精妙的",
  engineering: "工程；工程学",
  equity: "公平；公正",
  evidence: "证据",
  explanation: "解释；说明",
  funding: "资金；资助",
  generative: "生成式的；有生产能力的",
  humility: "谦逊；谦卑",
  implication: "含义；暗示；影响",
  inequality: "不平等",
  integrity: "诚信；完整性",
  intellectual: "智力的；知识分子的",
  interpret: "解释；口译",
  interpretation: "解释；阐释",
  measure: "措施；衡量",
  motive: "动机",
  negotiate: "协商；谈判",
  policy: "政策",
  precise: "精确的；严谨的",
  preserve: "保留；维护",
  public: "公共的；公众",
  reflective: "反光的；反思的",
  researcher: "研究人员",
  resident: "居民",
  revise: "修订；复习",
  routine: "常规的；惯例",
  scholarship: "学术研究；奖学金",
  social: "社会的；社交的",
  supervisor: "导师；监督者",
  transparent: "透明的；清楚的",
  uncertainty: "不确定性",
  university: "大学；高校",
  vague: "模糊的；含糊的"
};

const rssSources = [
  {
    type: "news",
    name: "BBC World",
    url: "https://feeds.bbci.co.uk/news/world/rss.xml"
  },
  {
    type: "news",
    name: "ScienceDaily",
    url: "https://www.sciencedaily.com/rss/top/science.xml"
  },
  {
    type: "news",
    name: "NPR News",
    url: "https://feeds.npr.org/1001/rss.xml"
  },
  {
    type: "news",
    name: "The Guardian",
    url: "https://www.theguardian.com/world/rss"
  },
  {
    type: "news",
    name: "PBS NewsHour",
    url: "https://www.pbs.org/newshour/feeds/rss/headlines"
  },
  {
    type: "news",
    name: "The New York Times",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml"
  },
  {
    type: "news",
    name: "Scientific American",
    url: "https://www.scientificamerican.com/feed/"
  },
  {
    type: "news",
    name: "The Atlantic",
    url: "https://www.theatlantic.com/feed/all/"
  },
  {
    type: "news",
    name: "TIME",
    url: "https://time.com/feed/"
  },
  {
    type: "news",
    name: "New Scientist",
    url: "https://www.newscientist.com/feed/"
  },
  {
    type: "news",
    name: "Newsweek",
    url: "https://www.newsweek.com/rss"
  }
];

const gutenbergSources = [
  {
    type: "literature",
    name: "Project Gutenberg - Sherlock Holmes",
    url: "https://www.gutenberg.org/cache/epub/1661/pg1661.txt"
  },
  {
    type: "literature",
    name: "Project Gutenberg - Pride and Prejudice",
    url: "https://www.gutenberg.org/cache/epub/1342/pg1342.txt"
  }
];

const categoryRules = [
  {
    id: "politics",
    label: "政治",
    keywords: [
      "government",
      "election",
      "president",
      "minister",
      "parliament",
      "congress",
      "senate",
      "policy",
      "diplomacy",
      "war",
      "military",
      "court",
      "law",
      "rights",
      "democracy",
      "republican",
      "democrat",
      "trump",
      "biden"
    ]
  },
  {
    id: "finance",
    label: "财经",
    keywords: [
      "market",
      "stock",
      "economy",
      "economic",
      "finance",
      "financial",
      "bank",
      "inflation",
      "trade",
      "business",
      "company",
      "investment",
      "investor",
      "earnings",
      "tariff",
      "currency",
      "recession",
      "jobs"
    ]
  },
  {
    id: "technology",
    label: "科技",
    keywords: [
      "technology",
      "tech",
      "software",
      "artificial intelligence",
      " ai ",
      "robot",
      "chip",
      "semiconductor",
      "computer",
      "internet",
      "cyber",
      "data",
      "algorithm",
      "platform",
      "app",
      "device"
    ]
  },
  {
    id: "science",
    label: "科学",
    keywords: [
      "science",
      "research",
      "study",
      "scientist",
      "physics",
      "biology",
      "chemistry",
      "space",
      "planet",
      "climate",
      "gene",
      "neural",
      "quantum",
      "laboratory"
    ]
  },
  {
    id: "health",
    label: "健康",
    keywords: [
      "health",
      "medical",
      "medicine",
      "disease",
      "doctor",
      "hospital",
      "vaccine",
      "brain",
      "virus",
      "mental",
      "treatment",
      "patient",
      "nutrition"
    ]
  },
  {
    id: "education",
    label: "教育",
    keywords: [
      "university",
      "school",
      "student",
      "teacher",
      "education",
      "academic",
      "campus",
      "college",
      "assessment",
      "course",
      "learning"
    ]
  },
  {
    id: "environment",
    label: "环境",
    keywords: [
      "climate",
      "environment",
      "energy",
      "carbon",
      "emission",
      "wildfire",
      "flood",
      "heat",
      "weather",
      "pollution",
      "conservation",
      "biodiversity"
    ]
  },
  {
    id: "culture",
    label: "文化",
    keywords: [
      "book",
      "film",
      "music",
      "art",
      "culture",
      "literature",
      "novel",
      "museum",
      "language",
      "history",
      "theater",
      "festival"
    ]
  }
];

function sendJson(response, payload, status = 200) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

function normalizeText(value = "") {
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function getEnv(name) {
  return globalThis.process?.env?.[name] || "";
}

function countWords(text = "") {
  return (String(text).match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) || []).length;
}

function categorizeArticle(article) {
  if (article.type === "literature") {
    return { category: "culture", categories: ["culture"] };
  }

  const haystack = ` ${article.title || ""} ${article.summary || ""} ${article.text || ""} `
    .toLowerCase()
    .replace(/\s+/g, " ");
  const scored = categoryRules
    .map((rule) => {
      const score = rule.keywords.reduce((total, keyword) => {
        const normalized = keyword.toLowerCase();
        return haystack.includes(normalized) ? total + 1 : total;
      }, 0);
      return { id: rule.id, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);

  const categories = scored.map((item) => item.id);
  return {
    category: categories[0] || "general",
    categories: categories.length ? categories : ["general"]
  };
}

function enrichArticle(article) {
  const difficulty = estimateDifficulty(article.text);
  const categoryInfo = categorizeArticle(article);
  return {
    ...article,
    ...difficulty,
    ...categoryInfo,
    wordCount: countWords(article.text)
  };
}

function extractReadableTextFromHtml(html = "") {
  const cleaned = html
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<(nav|footer|header|aside)\b[\s\S]*?<\/\1>/gi, " ");
  const paragraphs = [...cleaned.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/gi)]
    .map((match) => normalizeText(match[1]))
    .filter((paragraph) => countWords(paragraph) >= 18 && paragraph.length < 1400);

  return paragraphs.slice(0, 14).join(" ");
}

function estimateDifficulty(text) {
  const words = (text.toLowerCase().match(/[a-z]+(?:'[a-z]+)?/g) || []).filter(Boolean);
  const sentences = Math.max(1, (text.match(/[.!?]+/g) || []).length);
  const longWords = words.filter((word) => word.length >= 8).length;
  const academicWords = words.filter((word) => glossary[word]).length;
  const avgSentence = words.length / sentences;
  const longRatio = words.length ? longWords / words.length : 0;
  const academicRatio = words.length ? academicWords / words.length : 0;
  const score = Math.round(
    Math.min(95, Math.max(35, avgSentence * 1.55 + longRatio * 90 + academicRatio * 120 + 34))
  );

  let level = "B1";
  if (score >= 78) level = "C1";
  else if (score >= 62) level = "B2";
  else if (score >= 50) level = "B1";

  return { score, level };
}

function targetRange(target) {
  const normalized = String(target || "B2").toUpperCase();
  if (normalized.includes("IELTS") || normalized === "C1") return [68, 86];
  if (normalized.includes("CET6") || normalized === "B2") return [58, 76];
  return [48, 68];
}

function distanceFromTarget(score, target) {
  const [min, max] = targetRange(target);
  if (score >= min && score <= max) return 0;
  return Math.min(Math.abs(score - min), Math.abs(score - max));
}

function parseRssItems(xml, source) {
  const matches = [...xml.matchAll(/<item\b[\s\S]*?<\/item>/gi)].slice(0, 12);
  return matches
    .map((match, index) => {
      const item = match[0];
      const title = normalizeText((item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/i) || item.match(/<title>([\s\S]*?)<\/title>/i) || [])[1]);
      const description = normalizeText((item.match(/<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/i) || item.match(/<description>([\s\S]*?)<\/description>/i) || [])[1]);
      const link = normalizeText((item.match(/<link>([\s\S]*?)<\/link>/i) || [])[1]);
      const publishedAt = normalizeText((item.match(/<pubDate>([\s\S]*?)<\/pubDate>/i) || [])[1]);
      const text = `${title}. ${description}`;

      return enrichArticle({
        id: `rss-${source.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
        type: "news",
        title: title || source.name,
        source: source.name,
        url: link,
        publishedAt,
        summary: description,
        text
      });
    })
    .filter((item) => item.title && item.text.length > 80);
}

async function expandRssArticle(item) {
  if (!item.url) return item;
  try {
    const response = await fetch(item.url, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) return item;
    const html = await response.text();
    const readableText = extractReadableTextFromHtml(html);
    if (countWords(readableText) <= countWords(item.text)) return item;
    return enrichArticle({
      ...item,
      text: readableText,
      summary: item.summary || readableText.split(" ").slice(0, 36).join(" ")
    });
  } catch {
    return item;
  }
}

function extractGutenbergExcerpt(raw, source, index) {
  const body = raw
    .replace(/^[\s\S]*?\*\*\* START OF (?:THE|THIS) PROJECT GUTENBERG EBOOK [\s\S]*?\*\*\*/i, "")
    .replace(/\*\*\* END OF (?:THE|THIS) PROJECT GUTENBERG EBOOK [\s\S]*$/i, "")
    .replace(/\r/g, "")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 40 && !/^(chapter|volume)\b/i.test(line))
    .slice(20 + index * 12, 28 + index * 12)
    .join(" ");

  const text = normalizeText(body).split(" ").slice(0, 520).join(" ");
  return enrichArticle({
    id: `gutenberg-${source.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`,
    type: "literature",
    title: `${source.name.replace("Project Gutenberg - ", "")} excerpt ${index + 1}`,
    source: source.name,
    url: source.url,
    publishedAt: "Public domain",
    summary: "Public-domain literature excerpt selected for intensive reading.",
    text
  });
}

async function collectArticles(type, target, minWords) {
  const collected = [];
  const tasks = [];

  if (type !== "literature") {
    for (const source of rssSources) {
      tasks.push((async () => {
        const response = await fetch(source.url, { signal: AbortSignal.timeout(2500) });
        if (response.ok) {
          const xml = await response.text();
          const expanded = await Promise.all(parseRssItems(xml, source).slice(0, 6).map(expandRssArticle));
          collected.push(...expanded);
        }
      })());
    }
  }

  if (type !== "news") {
    for (const source of gutenbergSources) {
      tasks.push((async () => {
        const response = await fetch(source.url, { signal: AbortSignal.timeout(3000) });
        if (response.ok) {
          const raw = await response.text();
          collected.push(extractGutenbergExcerpt(raw, source, 0));
          collected.push(extractGutenbergExcerpt(raw, source, 1));
        }
      })());
    }
  }

  await Promise.allSettled(tasks);

  const fallback = fallbackArticles
    .filter((item) => type === "all" || item.type === type)
    .map(enrichArticle);
  return [...collected, ...fallback]
    .filter((item) => item.text && (type === "all" || item.type === type))
    .filter((item) => item.wordCount >= minWords)
    .sort((a, b) => distanceFromTarget(a.score, target) - distanceFromTarget(b.score, target))
    .slice(0, 50);
}

function articleKey(article) {
  const url = String(article.url || "").trim().toLowerCase();
  if (url) return `url:${url}`;
  return `title:${String(article.source || "").toLowerCase()}::${String(article.title || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim()}`;
}

async function readArticleLibrary() {
  try {
    const raw = await readFile(libraryPath, "utf8");
    const parsed = JSON.parse(raw);
    const articles = Array.isArray(parsed.articles) ? parsed.articles : [];
    return articles.map((article) => enrichArticle(article));
  } catch {
    return fallbackArticles.map((article) => ({
      ...enrichArticle(article),
      collectedAt: article.publishedAt || new Date().toISOString()
    }));
  }
}

async function writeArticleLibrary(articles) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(
    libraryPath,
    JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        articles
      },
      null,
      2
    ),
    "utf8"
  );
}

async function mergeIntoArticleLibrary(newArticles) {
  const stored = await readArticleLibrary();
  const byKey = new Map(stored.map((article) => [articleKey(article), article]));
  let added = 0;
  let updated = 0;
  const now = new Date().toISOString();

  for (const article of newArticles.map(enrichArticle)) {
    const key = articleKey(article);
    const existing = byKey.get(key);
    if (!existing) {
      byKey.set(key, {
        ...article,
        collectedAt: now,
        updatedAt: now
      });
      added += 1;
      continue;
    }

    const merged = enrichArticle({
      ...existing,
      ...article,
      collectedAt: existing.collectedAt || now,
      updatedAt: now,
      text:
        countWords(article.text) > countWords(existing.text)
          ? article.text
          : existing.text,
      summary: article.summary || existing.summary
    });
    byKey.set(key, merged);
    updated += 1;
  }

  const articles = [...byKey.values()].sort(
    (a, b) => new Date(b.collectedAt || b.publishedAt || 0) - new Date(a.collectedAt || a.publishedAt || 0)
  );
  await writeArticleLibrary(articles);

  return {
    articles,
    added,
    updated,
    total: articles.length
  };
}

async function readBody(request) {
  const chunks = [];
  for await (const chunk of request) chunks.push(chunk);
  const body = Buffer.concat(chunks).toString("utf8");
  return body ? JSON.parse(body) : {};
}

function hasChinese(text = "") {
  return /[\u3400-\u9fff]/.test(text);
}

function cleanTranslation(text = "") {
  return normalizeText(text)
    .replace(/^["']|["']$/g, "")
    .trim();
}

async function translateWithAzure(text) {
  const key = getEnv("AZURE_TRANSLATOR_KEY");
  if (!key) return null;

  const endpoint = getEnv("AZURE_TRANSLATOR_ENDPOINT") || "https://api.cognitive.microsofttranslator.com";
  const region = getEnv("AZURE_TRANSLATOR_REGION");
  const headers = {
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": key
  };
  if (region) headers["Ocp-Apim-Subscription-Region"] = region;

  const response = await fetch(`${endpoint}/translate?api-version=3.0&from=en&to=zh-Hans`, {
    method: "POST",
    headers,
    body: JSON.stringify([{ Text: text }]),
    signal: AbortSignal.timeout(6000)
  });
  if (!response.ok) return null;

  const payload = await response.json();
  const translatedText = cleanTranslation(payload?.[0]?.translations?.[0]?.text);
  return translatedText ? { meaning: translatedText, source: "Azure Translator" } : null;
}

async function translateWithDeepL(text) {
  const key = getEnv("DEEPL_API_KEY");
  if (!key) return null;

  const endpoint = getEnv("DEEPL_API_URL") || "https://api-free.deepl.com/v2/translate";
  const params = new URLSearchParams({
    text,
    source_lang: "EN",
    target_lang: "ZH"
  });

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${key}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params,
    signal: AbortSignal.timeout(6000)
  });
  if (!response.ok) return null;

  const payload = await response.json();
  const translatedText = cleanTranslation(payload?.translations?.[0]?.text);
  return translatedText ? { meaning: translatedText, source: "DeepL" } : null;
}

async function translateWithLibre(text) {
  const endpoint = getEnv("LIBRETRANSLATE_URL");
  if (!endpoint) return null;

  const body = {
    q: text,
    source: "en",
    target: "zh",
    format: "text"
  };
  const apiKey = getEnv("LIBRETRANSLATE_API_KEY");
  if (apiKey) body.api_key = apiKey;

  const response = await fetch(`${endpoint.replace(/\/$/, "")}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(6000)
  });
  if (!response.ok) return null;

  const payload = await response.json();
  const translatedText = cleanTranslation(payload?.translatedText);
  return translatedText ? { meaning: translatedText, source: "LibreTranslate" } : null;
}

function splitForTranslation(text, maxLength = 430) {
  const sentences = String(text || "").match(/[^.!?]+[.!?]+[\s"'»)\]]*/g) || [text];
  const chunks = [];
  let current = "";

  for (const sentence of sentences.map((item) => item.trim()).filter(Boolean)) {
    if ((current + " " + sentence).trim().length <= maxLength) {
      current = (current + " " + sentence).trim();
      continue;
    }
    if (current) chunks.push(current);
    if (sentence.length <= maxLength) {
      current = sentence;
    } else {
      const words = sentence.split(/\s+/);
      current = "";
      for (const word of words) {
        if ((current + " " + word).trim().length > maxLength) {
          if (current) chunks.push(current);
          current = word;
        } else {
          current = (current + " " + word).trim();
        }
      }
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

async function translateMyMemoryChunk(text) {
  const response = await fetch(
    `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|zh-CN`,
    { signal: AbortSignal.timeout(6000) }
  );
  if (!response.ok) return "";

  const payload = await response.json();
  return cleanTranslation(payload?.responseData?.translatedText);
}

async function translateWithMyMemory(text) {
  const chunks = splitForTranslation(text);
  const translatedChunks = [];

  for (const chunk of chunks.slice(0, 8)) {
    const translated = await translateMyMemoryChunk(chunk);
    if (translated) translatedChunks.push(translated);
  }

  const translatedText = translatedChunks.join("\n");
  return translatedText && hasChinese(translatedText)
    ? { meaning: translatedText, source: "MyMemory" }
    : null;
}

async function lookupEnglishDefinition(key) {
  try {
    const dictionaryResponse = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(key)}`,
      { signal: AbortSignal.timeout(4500) }
    );
    if (!dictionaryResponse.ok) return null;
    const entries = await dictionaryResponse.json();
    const firstDefinition = entries?.[0]?.meanings?.[0]?.definitions?.[0]?.definition;
    return firstDefinition ? { meaning: `英文释义：${firstDefinition}`, source: "DictionaryAPI" } : null;
  } catch {
    return null;
  }
}

async function translateToChinese(rawText) {
  const text = String(rawText || "").trim().replace(/\s+/g, " ");
  const key = text.toLowerCase().replace(/^[^a-z]+|[^a-z]+$/g, "");
  const providers = [
    translateWithAzure,
    translateWithDeepL,
    translateWithLibre,
    translateWithMyMemory
  ];

  for (const provider of providers) {
    try {
      const result = await provider(text);
      if (result?.meaning) return result;
    } catch {
      // Try the next provider; a local reading workflow should not fail on one API.
    }
  }

  if (glossary[key]) return { meaning: glossary[key], source: "Local glossary" };

  if (/^[a-z][a-z'-]{1,40}$/i.test(key)) {
    const definition = await lookupEnglishDefinition(key);
    if (definition) return definition;
  }

  return {
    meaning: "未找到自动释义，可手动填写中文释义后加入生词本。",
    source: "Manual"
  };
}

async function handleApi(request, response, url) {
  if (request.method === "GET" && url.pathname === "/api/library") {
    const type = url.searchParams.get("type") || "all";
    const level = url.searchParams.get("level") || "B2";
    const minWords = Math.max(120, Number(url.searchParams.get("minWords") || 300));
    const mode = url.searchParams.get("mode") || "collect";

    if (mode === "stored") {
      const articles = await readArticleLibrary();
      sendJson(response, {
        articles,
        categories: categoryRules.map(({ id, label }) => ({ id, label })),
        minWords,
        added: 0,
        updated: 0,
        total: articles.length
      });
      return true;
    }

    const collected = await collectArticles(type, level, minWords);
    const result = await mergeIntoArticleLibrary(collected);
    sendJson(response, {
      ...result,
      categories: categoryRules.map(({ id, label }) => ({ id, label })),
      minWords
    });
    return true;
  }

  if (request.method === "POST" && url.pathname === "/api/translate") {
    const body = await readBody(request);
    const rawText = String(body.text || "").trim();
    const translation = await translateToChinese(rawText);

    sendJson(response, {
      text: rawText,
      meaning: translation.meaning,
      source: translation.source,
      pronunciation: "",
      examples: []
    });
    return true;
  }

  return false;
}

async function serveStatic(response, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(publicDir, safePath));
  if (!filePath.startsWith(publicDir)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath)] || "application/octet-stream"
    });
    response.end(file);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", `http://${request.headers.host}`);
    if (url.pathname.startsWith("/api/") && (await handleApi(request, response, url))) return;
    await serveStatic(response, url.pathname);
  } catch (error) {
    sendJson(response, { error: error.message || "Server error" }, 500);
  }
});

server.listen(port, () => {
  console.log(`EnglishST is running at http://localhost:${port}`);
});
