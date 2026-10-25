import { defineConfig } from 'vitepress'
import { backgroundImagesPlugin } from './background-images.js'
import site, { getSiteUrl } from './site.js'
import { transformPageData, writeRobots } from './seo.js'

const siteUrl = getSiteUrl()
if (!siteUrl) console.warn('[SEO] 正式域名未配置：暂不生成 canonical、og:url、sitemap 及 robots 的 Sitemap 地址。')

/**
 * VitePress 站点配置；原生页面数据输出 title/description，SEO 构建钩子补齐 OG 与正式地址。
 * robots 的规则来自 public/robots.txt，Sitemap 地址在构建结束时按 site.js 生成。
 */
export default defineConfig({
  lang: 'zh-Hans',
  title: site.title,
  description: site.description,

  // 数据源文章和写作维护文档仅供读取，不生成站点页面；避免自定义 Layout 将维护文档回退显示为首页。
  srcExclude: ['**/posts/*.md', '写作规范.md', '文章模板.md'],

  ignoreDeadLinks: true,

  head: [
    // SEO meta
    ['meta', { name: 'author', content: site.title }],
    ['meta', { name: 'keywords', content: 'Code, ACG, Aurora, 槐序霁, VitePress' }],
    ['meta', { name: 'robots', content: 'index,follow' }],
    ['meta', { name: 'referrer', content: 'no-referrer' }],
    // Favicon
    ['link', { rel: 'apple-touch-icon', sizes: '180x180', href: '/assets/apple-touch-icon.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/assets/favicon-16x16.png' }],
    ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/assets/favicon-32x32.png' }],
  ],

  // 未确认域名时不产出虚假的站点地图；填好 site.url 后与 canonical/robots 一并启用。
  sitemap: siteUrl ? { hostname: siteUrl } : undefined,
  transformPageData,
  buildEnd: writeRobots,

  markdown: {
    // Aurora 自带代码高亮配色，由主题 custom.css 提供
    theme: 'github-dark'
  },

  vite: {
    plugins: [backgroundImagesPlugin()],
    //gray-matter 在浏览器端构建时依赖 js-yaml / sections 等子模块，预打包以提升 dev 体验
    optimizeDeps: {
      include: ['gray-matter']
    }
  }
})
