# EnglishST

EnglishST 是一个面向英语阅读学习的本地 Web 应用，目标是帮助学习者通过真实英文文章积累学术交流能力，同时服务于 CET6 和 IELTS Academic 备考。

它会持续收集适合阅读训练的英文新闻和公版小说片段，保存到本地资料库，并提供划词翻译、整段翻译、生词本、CSV 导出、收藏、已读筛选和主题分类等功能。

![EnglishST screenshot](./englishst-screenshot.png)

## 功能

- 持续收集英文文章到本地资料库
- 按难度、内容类型、主题、字数、关键词筛选文章
- 根据关键词自动区分政治、财经、科技、科学、健康、教育、环境、文化等主题
- 阅读区支持划词/短语翻译
- 点击段落右上角“译”按钮可进行整段翻译
- 生词可保存到本地生词本
- 生词本支持 CSV 导出，方便导入 Anki、欧路词典等背词软件
- 支持收藏文章、每日推荐、已读/未读筛选
- 文章来源、词数、难度和原文链接会在界面中标注

## 快速开始

需要先安装 Node.js。建议使用 Node.js 20 或更高版本。

```bash
npm start
```

然后在浏览器打开：

```text
http://localhost:5183
```

Windows 用户也可以双击运行：

```text
start.bat
```

## 使用方式

1. 点击“收集文章”，应用会从新闻 RSS 和 Project Gutenberg 等来源收集文章。
2. 收集到的文章会追加保存到本地资料库，不会因为再次收集而覆盖旧文章。
3. 使用顶部筛选器按难度、类型、主题和字数筛选文章。
4. 阅读时选中单词或短语，会出现翻译弹窗。
5. 点击段落右上角“译”按钮，可以展开整段中文翻译。
6. 点击“加入生词本”保存生词，之后可点击“导出生词”导出 CSV。

## 翻译 API 配置

应用默认会尝试使用免配置的 MyMemory 翻译服务，并保留本地词表和英文词典作为兜底。

如果需要更稳定的翻译效果，可以配置以下环境变量之一。

### Azure Translator

```bash
set AZURE_TRANSLATOR_KEY=your_key
set AZURE_TRANSLATOR_REGION=your_region
set AZURE_TRANSLATOR_ENDPOINT=https://api.cognitive.microsofttranslator.com
npm start
```

### DeepL

```bash
set DEEPL_API_KEY=your_key
npm start
```

可选：

```bash
set DEEPL_API_URL=https://api-free.deepl.com/v2/translate
```

### LibreTranslate

```bash
set LIBRETRANSLATE_URL=http://localhost:5000
set LIBRETRANSLATE_API_KEY=your_key_if_needed
npm start
```

翻译服务优先级：

```text
Azure Translator -> DeepL -> LibreTranslate -> MyMemory -> 本地词表 -> 英文词典释义
```

## 本地资料库

文章会保存在：

```text
data/articles.json
```

每篇文章会记录标题、正文、来源、原文链接、发布时间、词数、难度评分、主题分类、收集时间等信息。

如果你不想把本地收集到的文章上传到 GitHub，可以在 `.gitignore` 中加入：

```gitignore
data/articles.json
```

如果你希望仓库自带一份示例资料库，则可以保留当前文件。

## 项目结构

```text
EnglishST/
├─ data/
│  └─ articles.json        # 本地文章资料库
├─ public/
│  ├─ index.html           # 页面结构
│  ├─ styles.css           # 界面样式
│  └─ app.js               # 前端交互逻辑
├─ englishst-screenshot.png
├─ package.json
├─ server.mjs              # 本地服务、文章收集、翻译接口
├─ start.bat               # Windows 一键启动脚本
└─ README.md
```

## 数据来源

当前内置来源包括：

- BBC World
- ScienceDaily
- NPR News
- The Guardian
- PBS NewsHour
- The New York Times
- Scientific American
- The Atlantic
- TIME
- New Scientist
- Newsweek
- Project Gutenberg

新闻来源可能存在网络限制、反爬限制或原文抓取失败的情况。应用会尽量使用 RSS 摘要和可读取的正文内容，并保留本地资料库中已经收集成功的文章。

## 注意事项

- 本项目是个人英语学习工具，不是商业新闻聚合服务。
- 请尊重各文章来源网站的版权和使用条款。
- 如果计划公开部署，需要重新评估内容抓取、缓存和版权策略。
- 默认运行在本地，不需要数据库。

## 后续计划

- 更精细的 CEFR / IELTS 难度评估
- 文章阅读进度记录
- 按主题生成每日阅读计划
- 生词复习状态和熟词隐藏
- 支持更多导出格式
- 支持用户自定义 RSS 来源
