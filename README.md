# 槐序霁 · Aurora 风格 VitePress 博客

基于 [VitePress](https://vitepress.dev/) 复刻 [Aurora / 蝉时雨](https://github.com/chanshiyucx/aurora) 视觉风格的静态博客。组件从 Vue 2 Options API 改为 Vue 3 `<script setup>`，数据源由 GitHub Issues 迁移为本地 Markdown，无后端数据库；随机封面和部分装饰素材仍使用第三方资源，封面有独立本地兜底。

当前改版仓库：[shuo0261/HuaiXuJI](https://github.com/shuo0261/HuaiXuJI)。原作者仓库仍为 [chanshiyucx/aurora](https://github.com/chanshiyucx/aurora)。

![技术栈](https://img.shields.io/badge/VitePress-1.6-646cff) ![Vue](https://img.shields.io/badge/Vue-3.5-42b883) ![License](https://img.shields.io/badge/License-MIT-green)

## 技术栈

| 分类     | 技术                                                                                                                        |
| -------- | --------------------------------------------------------------------------------------------------------------------------- |
| 框架     | [VitePress](https://vitepress.dev/) 1.6 + Vue 3.5（`<script setup>` 组合式 API）                                            |
| 数据层   | 本地 Markdown + `import.meta.glob` 读取原文 + [gray-matter](https://github.com/jonschlinkert/gray-matter) 解析 front-matter |
| 样式     | 原版 SCSS 变量全部转为 CSS 自定义属性，并与 VitePress `--vp-` 变量体系映射                                                  |
| 图标     | Fontello 图标字体（随主题本地托管）                                                                                         |
| 看板娘   | Live2D（原版模型，纯前端渲染）                                                                                              |
| 状态管理 | 组合式响应式 store（替代 Vuex，无额外依赖）                                                                                 |
| 评论区   | 预留 `<div id="artalk-comments"></div>` 占位（待接入 [Artalk](https://artalk.js.org/)）                                     |

已剥离的依赖：Vuex、GitHub Issues API、LeanCloud、Gitalk、jQuery/backstretch、vue-progressbar、APlayer。

## 主要功能

- 本地 Markdown 写作，首页、归档、分类与标签自动聚合。
- 文章独立 SEO 与 SSR 正文，二级、三级标题自动目录；桌面侧栏、手机折叠入口。
- Maple Mono NF CN 本地 WOFF2 分包、浅色毛玻璃卡片与响应式阅读布局。
- 本地随机背景池；文章封面独立选择，同次浏览保持稳定，失败回退本地图。
- 桌面 Live2D 延迟加载及本地互动文案，手机跳过模型下载；部分贴图仍使用原远程地址。
- 关于本站、个人寄语与资料、朱自清《匆匆》全文，以及原主题友链。

## 快速开始

```bash
# 当前 Vite 依赖要求 Node.js ^18.0.0 || >=20.0.0；新环境选官方仍维护的 LTS，详见部署指南文章。
cd blog
npm ci

# 本地开发（热更新）
npm run docs:dev        # 打开 http://localhost:5173

# 生产构建（产物输出到 docs/.vitepress/dist）
npm run docs:build

# 本地预览构建产物
npm run docs:preview
```

## 目录结构

```
blog/
├── docs/
│   ├── posts/                    # ★ 文章目录（写博客只看这里）
│   ├── index.md                  # 首页入口（内容由主题渲染）
│   ├── archive.md / category.md / tag.md / friend.md / about.md
│   ├── post/
│   │   ├── [slug].md             # 文章详情页动态路由
│   │   └── [slug].paths.js       # 扫描 posts 目录生成路由
│   ├── public/                   # 原样拷贝的静态资源（favicon、robots.txt、live2d）
│   └── .vitepress/
│       ├── config.js             # 站点配置（SEO / sitemap / meta）
│       └── theme/
│           ├── index.js          # 主题入口
│           ├── Layout.vue        # 全局布局（对应原 App.vue + router）
│           ├── config.js         # ★ 站点/主题配置（标题、友链、关于页等）
│           ├── custom.css        # ★ 全站样式（CSS 变量 + --vp- 映射）
│           ├── posts.js          # ★ 数据层（glob 读取 + front-matter 解析）
│           ├── components/       # 通用组件（Header/Footer/Cover/MarkDown…）
│           └── views/            # 页面视图（Home/Post/Archive/Category/Tag/Friend/About）
└── package.json
```

## 怎么写文章

可先复制 [文章模板](docs/文章模板.md)，并阅读 [写作规范](docs/写作规范.md) 与站内 [Markdown 写作指南源文](docs/posts/2026-10-25-markdown-writing-guide.md)。

在 `docs/posts/` 下新建 Markdown 文件，**文件名必须以日期开头**（`YYYY-MM-DD-标题Slug.md`）；Frontmatter 的 `date` 决定排序，文件名日期前缀被去掉，Slug 决定访问地址（`/post/<slug>.html`）：

```
docs/posts/2026-10-25-about-huaixuji.md
→ /post/about-huaixuji.html（正式域名由 site.js 的 url 配置）
```

### front-matter 说明

```yaml
---
title: 文章标题 # 必填
date: 2026-01-10 # 必填，发布时间（显示与排序均基于此）
category: 前端 # 可选，分类（分类页自动聚合）
tags: [Vue, 笔记] # 可选，标签（标签页自动聚合）
cover: "/images/posts/my-note/cover.webp" # 可选，也支持完整 HTTPS 地址；先放入实际图片
coverTitle: 封面副标 # 可选，标题条右侧的小字副标，不填则不显示
description: 摘要文字 # 可选，列表卡片摘要，不填取正文首段
hot: 99 # 可选，热度数值，默认 1
---
```

正文使用标准 Markdown，支持：

- 标题（h2 起、自动带 Fontello 装饰图标）、代码块（macOS 红绿灯样式）、表格、引用
- 至少两个 h2/h3 时展示目录，中文及重复标题共享稳定锚点
- 图片自动包裹响应式容器：圆角 8px、`max-width: 100%`、`loading="lazy"` 懒加载
- 文章使用独立 markdown-it 渲染器；数学公式、任务复选框、Vue 组件与逐词语法高亮尚未接入，详见《Markdown 写作指南》

## 怎么发布文章

1. 在 `docs/posts/` 写好 `.md` 文件并保存；
2. 本地 `npm run docs:dev` 预览确认无误；
3. 执行 `npm run docs:build`，把 `docs/.vitepress/dist/` 整个目录发布到任意静态托管即可（见下文部署）。

> 也可以用 Git 工作流：推送文章到仓库，让 CI（GitHub Actions / Vercel / Netlify）自动构建发布。新增文章**无需改任何配置**——列表、归档、分类、标签、文章页全部由数据层自动聚合生成。

## 图片管理

本地图片放在 `docs/public/images/`，适合稳定封面、图标和重要资源；已有 WebP 可以继续使用，无需迁移到图床。普通正文使用标准 Markdown：

```markdown
![图片说明](/images/example.webp)
![图片说明](https://img.example.com/posts/example.webp)
```

`/images/example.webp` 是站点根相对路径，对应 `docs/public/images/example.webp`。页面相对路径 `../images/example.webp` 在 `/post/<slug>.html` 下也指向 `/images/example.webp`；它相对的是发布后的页面，不能按 Markdown 源文件的磁盘位置推断。优先使用 `/images/` 写法。

`cover` 支持同样的本地路径和完整 HTTPS URL，普通显式封面优先；省略时按文章顺序使用本地封面。既有随机接口封面通过一次多图请求独立选择，重复、超时或超过大小预算时回退到各自本地图，详见 [封面说明](docs/public/images/covers/README.txt)。

完整 HTTPS URL 可用于未来的自建图床，静态部署不会妨碍浏览器访问远程图片。外链可能受网络、证书、防盗链和服务可用性影响；SEO 分享图使用稳定 URL，不使用随机图片接口。上面的 `img.example.com` 仅为文档示例，不是项目真实配置。项目不自动上传图片，也不改变 `docs/public/img/` 随机背景池。

## 怎么修改 / 定制

| 想改什么           | 改哪里                                                                                                                                                     |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 站点标题、副标题   | `.vitepress/site.js` → `title` / `subtitle`（主题与 SEO 共用）                                                                                           |
| 主题色、配色板     | `theme/custom.css` 的 `:root` CSS 变量（`--purple-*` 等），已映射到 VitePress `--vp-*`                                                                     |
| 背景图（刷新随机） | 授权图片放入 `docs/public/img/`；启动/构建时自动筛选 ≤3 MB 的 JPG/PNG/WebP/AVIF，完整打开时随机一张（详见目录 README.txt）                            |
| 友链               | `theme/config.js` → `friends` 数组（name / link / avatar / cover）                                                                                         |
| 关于页             | `theme/config.js` → `about`（分段落数组）、`aboutOpts`（头像、联系方式）                                                                                   |
| 当前改版仓库       | `theme/config.js` → `rebuiltRepository`；留空不显示页脚仓库链接，原作者 Aurora 链接独立保留                                                               |
| 分类摘要与封面     | `theme/config.js` → `categories`                                                                                                                           |
| SEO                | `.vitepress/site.js` → `title` / `description` / `url`；正式 URL 留空时不生成地址，填写后构建自动统一 canonical、og:url、sitemap 和 robots；文章复用自身标题和摘要 |
| 组件/页面          | `theme/components/`、`theme/views/`（Vue 3 `<script setup>`）                                                                                              |
| 全局样式           | `theme/custom.css`（含移动端断点 767px 的响应式规则）                                                                                                      |

> 注意：`docs/posts/*.md` 是数据文件，已在 `config.js` 中通过 `srcExclude` 排除，不会被构建成站点页面。

## 怎么部署

构建产物是纯静态文件（`docs/.vitepress/dist/`），任何静态托管都能用。

完整步骤见 [IIS、Nginx 与 Docker 部署指南](docs/posts/2026-10-25-huaixuji-deployment-guide.md)，其中也说明 HTTPS、Cloudflare 缓存及图片路径。

### GitHub Pages（GitHub Actions 自动化）

`.github/workflows/deploy.yml` 示例：

```yaml
name: Deploy
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run docs:build
      - uses: actions/upload-pages-artifact@v3
        with: { path: docs/.vitepress/dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
    steps:
      - uses: actions/deploy-pages@v4
```

### Vercel / Netlify

- Build Command：`npm run docs:build`
- Output Directory：`docs/.vitepress/dist`

### 部署到子路径

当前自定义路由、公共资源和 `site.js` 按域名根路径工作，部署时使用站点根目录。不能仅添加 VitePress `base` 就视为已支持子路径；本轮不调整路由架构，详见部署指南。

## 评论系统接入（Artalk）

文章详情页底部已预留 `<div id="artalk-comments"></div>`。接入方式：

1. 自行部署 Artalk 服务端；
2. 在 `.vitepress/config.js` 的 `head` 中加入 Artalk 的 CSS 与 JS；
3. 在 `theme/views/Post.vue` 中初始化（`new Artalk({ el: '#artalk-comments', ... })`）。

## 已知实现说明

- **RouterLink 垫片**：VitePress 不暴露 vue-router 的 `<RouterLink>`，主题提供了渲染真实 `<a>` 的同名组件（输出 `router-link-active` 等类名，最终 DOM 与 vue-router 一致）。
- **Buffer 垫片**：gray-matter 在浏览器端需要 `Buffer`，`theme/node-shims.js` 已注入 polyfill。
- **glob 双语法**：`import.meta.glob('../posts/*.md', { as: 'raw' })` 为需求指定的写法，该语法在 Vite 5 中已弃用（运行返回空），因此叠加 `{ eager: true, query: '?raw', import: 'default' }` 等价写法合并兜底。
- **看板娘 / APlayer**：Live2D 完整保留（换装、切换模型、拍照）；音乐播放器 APlayer 未移植。

## 致谢

- [Aurora](https://github.com/chanshiyucx/aurora) — 原版主题（蝉時雨）
- [VitePress](https://vitepress.dev/) — 站点框架
- [DreamOfIce/GenshinWallpaper](https://github.com/DreamOfIce/GenshinWallpaper) — 测试期背景图（原神官方壁纸）

English documentation: [README.en.md](./README.en.md)
