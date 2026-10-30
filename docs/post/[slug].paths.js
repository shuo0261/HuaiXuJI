import { readPostSources } from '../.vitepress/post-source.js'

// 动态路由与 SEO/OG 复用同一文章源和 slug 校验，避免分享图与页面错配。
export default {
  paths() { return readPostSources().map(({ slug }) => ({ params: { slug } })) },
}
