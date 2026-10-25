import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import matter from 'gray-matter'
import site, { getSiteUrl } from './site.js'
import theme from './theme/config.js'

const postsDirectory = fileURLToPath(new URL('../posts/', import.meta.url))
const robotsFile = fileURLToPath(new URL('../public/robots.txt', import.meta.url))
const managedProperties = new Set(['og:title', 'og:description', 'og:type', 'og:site_name', 'og:image', 'og:url'])

function absoluteCover(cover, siteUrl) {
  if (!cover) return ''
  if (cover.startsWith('//')) return new URL(`https:${cover}`).href
  if (/^https?:\/\//i.test(cover)) return new URL(cover).href
  // 本地封面在域名确认前不能编造绝对地址；已有外部封面仍可正常输出。
  return siteUrl ? new URL(cover, `${siteUrl}/`).href : ''
}

/** SSR/开发编译共同生成 head；title、description 交给 VitePress 原生输出，避免重复标签。 */
export function createSeoHead({ title, description, pagePath, cover, type = 'website', head = [], siteUrl = getSiteUrl() }) {
  const result = head.filter(([tag, attrs = {}]) => tag !== 'title' &&
    !(tag === 'meta' && (attrs.name === 'description' || managedProperties.has(attrs.property))) &&
    !(tag === 'link' && attrs.rel === 'canonical'))
  result.push(
    ['meta', { property: 'og:title', content: title }],
    ['meta', { property: 'og:description', content: description }],
    ['meta', { property: 'og:type', content: type }],
    ['meta', { property: 'og:site_name', content: site.title }],
  )
  // SSR 分享阶段不采用用户指定的随机封面接口；复用已有本地图标，域名未确定时省略无法组成绝对 URL 的 og:image。
  const coverUrl = cover ? absoluteCover(cover, siteUrl) : ''
  const randomCover = coverUrl && new URL(coverUrl).hostname === 't.alcy.cc' && /^\/ysz\/?$/.test(new URL(coverUrl).pathname)
  const image = randomCover ? absoluteCover(theme.defaultShareImage, siteUrl) : coverUrl
  if (image) result.push(['meta', { property: 'og:image', content: image }])
  if (siteUrl) {
    const url = new URL(pagePath, `${siteUrl}/`).href
    result.push(['link', { rel: 'canonical', href: url }], ['meta', { property: 'og:url', content: url }])
  }
  return result
}

/** VitePress 编译 Markdown 时调用；只读取既有字段，不改文章对象、正文或 slug。 */
export function transformPageData(pageData) {
  if (pageData.relativePath === '404.md') return
  const slug = pageData.params?.slug
  let article
  if (pageData.relativePath.startsWith('post/') && slug) {
    const file = fs.readdirSync(postsDirectory).find(file => file.endsWith('.md') &&
      file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}-\d{2}-/, '') === slug)
    if (file) article = matter(fs.readFileSync(path.join(postsDirectory, file), 'utf8'))
  }
  const title = article ? String(article.data.title || '未命名文章') : pageData.title || site.title
  // 摘要回退与现有 posts.js 一致；作者填写 description 后，同时供列表和 SSR SEO 使用。
  const description = article ? String(article.data.description || article.content.trim().split('\n')
    .find(line => line.trim() && !line.trim().startsWith('<')) || '') : pageData.description || site.description
  const pagePath = pageData.relativePath === 'index.md' ? '/' : `/${pageData.relativePath.replace(/\.md$/, '.html')}`
  const head = createSeoHead({ title, description, pagePath,
    cover: article ? String(article.data.cover || theme.defaultCover) : '',
    type: article ? 'article' : 'website', head: pageData.frontmatter.head || [] })
  return { title, description, frontmatter: { ...pageData.frontmatter, title, description, head } }
}

/** 生产构建结束时只写产物，保留 robots 的现有规则；Sitemap 地址始终来自同一个站点 URL。 */
export function writeRobots({ outDir }, siteUrl = getSiteUrl()) {
  const rules = fs.readFileSync(robotsFile, 'utf8').replace(/^Sitemap:.*$/gmi, '').trimEnd()
  fs.writeFileSync(path.join(outDir, 'robots.txt'), `${rules}\n${siteUrl ? `\nSitemap: ${siteUrl}/sitemap.xml\n` : ''}`, 'utf8')
}
