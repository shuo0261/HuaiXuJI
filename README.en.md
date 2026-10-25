# Aurora-Style VitePress Blog

A static blog that fully replicates the visual style of [Aurora](https://github.com/chanshiyucx/aurora), built on [VitePress](https://vitepress.dev/). All components have been rewritten from Vue 2 Options API to Vue 3 `<script setup>`, and the data source has been migrated from GitHub Issues to local Markdown — no backend, no third-party services.

![Tech](https://img.shields.io/badge/VitePress-1.6-646cff) ![Vue](https://img.shields.io/badge/Vue-3.5-42b883) ![License](https://img.shields.io/badge/License-MIT-green)

## Tech Stack

| Category | Technology |
|---|---|
| Framework | [VitePress](https://vitepress.dev/) 1.6 + Vue 3.5 (`<script setup>` Composition API) |
| Data layer | Local Markdown + `import.meta.glob` raw imports + [gray-matter](https://github.com/jonschlinkert/gray-matter) front-matter parsing |
| Styling | Original SCSS variables converted to CSS custom properties, mapped onto the VitePress `--vp-*` variable system |
| Icons | Fontello icon font (self-hosted with the theme) |
| Live2D waifu | Original Live2D models, rendered fully client-side |
| State | Composable reactive store (replaces Vuex, zero extra deps) |
| Comments | Placeholder `<div id="artalk-comments"></div>` (for [Artalk](https://artalk.js.org/) integration) |

Removed dependencies: Vuex, GitHub Issues API, LeanCloud, Gitalk, jQuery/backstretch, vue-progressbar, APlayer.

## Quick Start

```bash
# Requires Node.js >= 18 (20 LTS recommended)
cd blog
npm install

# Local development (hot reload)
npm run docs:dev        # open http://localhost:5173

# Production build (outputs to docs/.vitepress/dist)
npm run docs:build

# Preview the production build locally
npm run docs:preview
```

## Project Structure

```
blog/
├── docs/
│   ├── posts/                    # ★ Posts directory (all you need for writing)
│   ├── index.md                  # Home entry (rendered by the theme)
│   ├── archive.md / category.md / tag.md / friend.md / about.md
│   ├── post/
│   │   ├── [slug].md             # Post detail dynamic route
│   │   └── [slug].paths.js       # Generates routes from the posts directory
│   ├── public/                   # Static assets copied as-is (favicon, robots.txt, live2d)
│   └── .vitepress/
│       ├── config.js             # Site config (SEO / sitemap / meta)
│       └── theme/
│           ├── index.js          # Theme entry
│           ├── Layout.vue        # Global layout (replaces App.vue + router)
│           ├── config.js         # ★ Site/theme config (title, friends, about…)
│           ├── custom.css        # ★ Global styles (CSS variables + --vp- mapping)
│           ├── posts.js          # ★ Data layer (glob reading + front-matter parsing)
│           ├── components/       # Shared components (Header/Footer/Cover/MarkDown…)
│           └── views/            # Page views (Home/Post/Archive/Category/Tag/Friend/About)
└── package.json
```

## Writing Posts

Create a Markdown file under `docs/posts/`. The **filename must start with a date** (`YYYY-MM-DD-title-slug.md`); the date controls ordering and the slug defines the URL (`/post/<slug>.html`):

```
docs/posts/2026-01-10-vitepress-custom-theme.md
→ https://your-domain.com/post/vitepress-custom-theme.html
```

### Front-matter Reference

```yaml
---
title: Post title        # required
date: 2026-01-10         # required, publish date (drives display & sorting)
category: Frontend       # optional, category (aggregated on the Category page)
tags: [Vue, Notes]       # optional, tags (aggregated on the Tag page)
cover: https://...       # optional, cover image; falls back to the default cover
coverTitle: Caption      # optional, small caption on the right of the title bar
description: Summary     # optional, card summary; defaults to the first paragraph
hot: 99                  # optional, popularity number, defaults to 1
---
```

The body is standard Markdown and supports:

- Headings (h2+ automatically get Fontello decorative icons), code blocks (macOS traffic-light style), tables, blockquotes
- Images automatically wrapped in a responsive container: 8px radius, `max-width: 100%`, `loading="lazy"`
- Math, task lists, and other native VitePress features

## Publishing Posts

1. Write the `.md` file in `docs/posts/` and save it;
2. Preview locally with `npm run docs:dev`;
3. Run `npm run docs:build` and publish the whole `docs/.vitepress/dist/` directory to any static host (see Deployment below).

> Git workflow also works: push posts to the repository and let CI (GitHub Actions / Vercel / Netlify) build and deploy automatically. **No config changes needed for new posts** — lists, archive, categories, tags and post pages are aggregated automatically by the data layer.

## Customization

| What to change | Where |
|---|---|
| Site title, subtitle | `theme/config.js` → `title` / `subtitle` |
| Theme colors | `:root` CSS variables in `theme/custom.css` (`--purple-*` etc.), mapped to VitePress `--vp-*` |
| Background images | Images live in `docs/public/bg/`, configured in `theme/config.js` → `bg` / `preview` (currently local copies of Genshin Impact wallpapers; swap in any image files) |
| Friend links | `theme/config.js` → `friends` array (name / link / avatar / cover) |
| About page | `theme/config.js` → `about` (sections) and `aboutOpts` (avatar, contacts) |
| Category summaries & covers | `theme/config.js` → `categories` |
| SEO | `.vitepress/config.js` → `title` / `description` / `sitemap.hostname` (**replace with your real domain before deploying**), and the Sitemap URL in `docs/public/robots.txt` |
| Components / pages | `theme/components/`, `theme/views/` (Vue 3 `<script setup>`) |
| Global styles | `theme/custom.css` (including responsive rules at the 767px mobile breakpoint) |

> Note: `docs/posts/*.md` are data files only — they are excluded via `srcExclude` in `config.js` and never built into site pages.

## Deployment

The build output is pure static files (`docs/.vitepress/dist/`) and works on any static host.

### GitHub Pages (GitHub Actions)

Example `.github/workflows/deploy.yml`:

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

- Build Command: `npm run docs:build`
- Output Directory: `docs/.vitepress/dist`

### Deploying to a Sub-path

If the site is not at the domain root (e.g. `user.github.io/blog/`), add `base: '/blog/'` to `.vitepress/config.js` and rebuild.

## Comment System (Artalk)

A `<div id="artalk-comments"></div>` placeholder is reserved at the bottom of every post. To enable it:

1. Deploy your own Artalk server;
2. Add the Artalk CSS and JS to `head` in `.vitepress/config.js`;
3. Initialize it in `theme/views/Post.vue` (`new Artalk({ el: '#artalk-comments', ... })`).

## Implementation Notes

- **RouterLink shim**: VitePress does not expose vue-router's `<RouterLink>`, so the theme ships a same-named component that renders a real `<a>` (with `router-link-active` class names, producing identical DOM).
- **Buffer shim**: gray-matter requires `Buffer` in the browser; `theme/node-shims.js` injects the polyfill.
- **Dual glob syntax**: `import.meta.glob('../posts/*.md', { as: 'raw' })` is the required spelling, but that option is deprecated in Vite 5 (resolves to nothing at runtime), so an equivalent `{ eager: true, query: '?raw', import: 'default' }` glob is merged in as a fallback.
- **Live2D waifu / APlayer**: Live2D is fully functional (dress-up, model switching, photo); the APlayer music widget was not ported.

## Credits

- [Aurora](https://github.com/chanshiyucx/aurora) — the original theme (chanshiyucx)
- [VitePress](https://vitepress.dev/) — site framework
- [DreamOfIce/GenshinWallpaper](https://github.com/DreamOfIce/GenshinWallpaper) — test-time backgrounds (official Genshin Impact wallpapers)

中文文档：[README.md](./README.md)
