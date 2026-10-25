---
title: "槐序霁：一个简约的二次元个人博客"
date: "2026-10-25"
category: "项目文档"
tags: ["槐序霁", "VitePress", "Vue3", "开源项目"]
cover: "https://t.alcy.cc/ysz"
coverTitle: "项目介绍"
description: "介绍槐序霁的设计来源、技术栈、现有功能与目录结构，并说明如何使用本地 Markdown 写作、调整主题和构建静态站点。"
hot: 1
---

## 为什么是槐序霁

槐序霁受到 [Aurora / 蝉时雨](https://github.com/chanshiyucx/aurora) 的设计启发：柔和的背景、通透的卡片，以及适度的二次元装饰。这个版本希望保留这样的温柔氛围，把日常维护收敛到几个简单动作：写 Markdown、预览、构建、发布。

目标是一个简约、二次元、打开速度快的静态个人博客。这里介绍项目本身，不代表作者的个人经历，也不承诺尚未实现的功能。

文章改用本地 Markdown 管理，是为了让内容可以随普通文件一起备份、查看差异和迁移；写作不必先维护数据库或内容后台。生成后的站点交给静态服务器即可运行。封面接口和部分装饰素材仍来自第三方，因此“文章不依赖后台 API”不等于“所有资源都能离线加载”。

## 当前技术栈

| 部分 | 当前实现 |
| --- | --- |
| 静态站点 | VitePress 1.6.4，负责开发、动态文章路径与生产 HTML 构建 |
| 界面 | Vue 3.5，自定义主题和页面组件 |
| 内容 | `docs/posts/*.md`，一篇文章对应一个文件 |
| 元数据 | gray-matter 解析 YAML Frontmatter |
| 文章正文 | markdown-it 15，使用主题自己的渲染规则 |
| 样式 | 普通 CSS、CSS 变量、本地 Fontello 图标 |
| 发布 | 上传 `docs/.vitepress/dist/` 中的静态产物 |

当前文章正文并没有直接使用 VitePress 默认主题的全部 Markdown 扩展。代码块有统一外观和 HTML 转义，但没有逐词语法高亮、复制按钮或行号；数学公式、任务复选框和 Vue 组件也没有作为正文扩展启用。详见 [Markdown 写作指南](/post/markdown-writing-guide.html)。

## 已有功能

- 首页展示文章封面、标题、摘要和入口。
- 文章详情展示日期、分类、标签与 Markdown 正文。
- 分类、标签按 Frontmatter 自动聚合；归档按 `date` 倒序组织。
- 关于页与友链页从本地主题配置读取资料。
- 随机背景在启动或构建时扫描本地图片池，每次完整打开选一张，站内路由切换保持不变。
- Maple Mono NF CN v7.9 使用本地 WOFF2、400/700 字重和 Unicode 分包；Nerd 图符按实际字符请求。
- 桌面 Live2D 延迟加载，移动端不展示时跳过资源下载；渲染器、模型和动作在本地，贴图仍使用原有远程地址，完整本地化尚待素材许可确认。
- 文章独立标题、摘要与 Open Graph 信息在 SSR 构建时输出；正式域名配置后，统一生成 canonical、og:url、sitemap 与 robots 中的 Sitemap 地址。

目前没有站内搜索、CMS 或已接入的评论服务。文章里的 `hot` 是静态展示数值，不是访问统计；也没有草稿过滤、定时发布和独立更新时间展示。

## 目录在哪里

```text
blog/
├─ package.json
├─ docs/
│  ├─ posts/                       文章源文件
│  ├─ post/[slug].paths.js         扫描文件生成文章 URL
│  ├─ post/[slug].md               文章页面入口
│  ├─ index.md、archive.md 等      站点页面入口
│  ├─ 写作规范.md、文章模板.md      本地维护文档，不发布为文章
│  ├─ public/
│  │  ├─ img/                     随机背景池
│  │  ├─ images/                  正文等本地图片
│  │  ├─ fonts/                   本地 Maple 字体与许可
│  │  └─ live2d/                  既有渲染脚本、模型、动作
│  └─ .vitepress/
│     ├─ site.js                  站名、简介、正式域名
│     ├─ config.js、seo.js         构建配置与 SEO
│     └─ theme/
│        ├─ config.js             Slogan、资料、友链、封面、页脚备案
│        ├─ posts.js              文章索引与分类、标签查询
│        ├─ Layout.vue            全站布局与路由视图
│        ├─ components/、views/   共用组件与页面
│        └─ custom.css            公共主题样式
└─ scripts/                       现有聚焦测试与离线字体生成工具
```

`aurora-master/` 是项目外层的原版参考目录，不是当前站点的构建输入。修改博客时操作 `blog/` 即可。

## 本地开发的四个命令

当前改版仓库是 [shuo0261/HuaiXuJI](https://github.com/shuo0261/HuaiXuJI)，原版仍是 [Aurora / 蝉时雨](https://github.com/chanshiyucx/aurora)。进入本地项目目录后使用 `package-lock.json` 锁定的依赖版本。

```powershell
cd E:\Code\MyCode\aurora-rebuild\blog
npm ci
npm run docs:dev
```

开发地址以终端实际输出为准。保存后检查页面；新增文章的动态路径没有出现时，先重启开发服务。

```powershell
npm run docs:build
npm run docs:preview
```

`docs:preview` 预览已有生产产物，不能代替构建。发布目录是 `docs/.vitepress/dist/`；正式静态服务器不需要运行 Node.js 或开发服务。Node 版本要求及环境准备见 [部署指南](/post/huaixuji-deployment-guide.html)。

## 如何更新内容和设置

| 想做什么 | 操作位置 |
| --- | --- |
| 新增文章 | 复制 `docs/文章模板.md` 到 `docs/posts/YYYY-MM-DD-slug.md`，填写 Frontmatter 与正文 |
| 修订文章 | 修改原 Markdown；保留 slug 可以保持文章 URL |
| 换随机背景 | 将有权使用的 JPG、PNG、WebP、AVIF 放入 `docs/public/img/`，再启动或构建；单张不超过 3 MB，优先 300–800 KB |
| 修改名称、简介 | `docs/.vitepress/site.js` 的 `title`、`subtitle`、`description` |
| 调整页面文案与资料 | `docs/.vitepress/theme/config.js` 的页面 `*Opts.qoute`、`about`、`aboutOpts`、`friends` |
| 调整默认封面 | 同一配置的 `defaultCover`，当前指向用户指定的原神随机图片接口 |
| 配置 SEO 域名 | `docs/.vitepress/site.js` 的 `url`，填写真实站点根 URL，随后重新构建 |
| 设置备案展示 | `theme/config.js` 的 `footer.icp`、`footer.police`，分别填写真实资料并开启 |

封面与背景是两条独立链路。封面接口失败时使用本站已有图标兜底，不会替换随机背景池。随机封面也不会直接当作永久分享图：SEO 使用稳定的本地 `defaultShareImage`，域名未确定时省略无法生成的 OG 图片绝对地址。

更新完成后依次检查文章、分类、标签、归档，执行生产构建，再把完整产物交给已有发布流程。发布新版本时不要把新旧目录简单叠加，以免已删除的旧 HTML 继续留在线上；先保留旧版本，再使用新的完整发布目录。

## 如何保持可维护

遵循项目 `AGENTS.md` 的原则：标准流程优先、最小可用优先、简单维护优先、问题后置。只修改当前任务必要的文件，保留中文说明，保护未提交内容，真实 Git 仓库中使用中文提交信息；没有仓库时不自行初始化，也不擅自 push。

可选的下一步应该来自真实写作需求，例如补齐个人资料、取得装饰素材许可或改善某个常用阅读环节。暂时没有必要为个人博客新增复杂后台、状态管理框架或一整套新主题架构。

## 从哪里继续

先读 [Markdown 写作指南](/post/markdown-writing-guide.html)，完成第一篇自己的文章；准备对外提供访问时，再按 [IIS、Nginx 与 Docker 部署指南](/post/huaixuji-deployment-guide.html) 检查配置和产物。

设计来源与技术资料：[Aurora](https://github.com/chanshiyucx/aurora)、[VitePress](https://vitepress.dev/)、[Vue](https://vuejs.org/)、[markdown-it](https://github.com/markdown-it/markdown-it)。
