export const localCovers = ['/images/covers/writing.svg', '/images/covers/cloud.svg', '/images/covers/grove.svg']

/** 文章索引和 Cover 在 SSR/客户端共用；只按 slug 做固定映射，新增或重排文章不会改变旧文章的默认封面。 */
export function coverFallback(slug = '') {
  let hash = 0
  for (const char of String(slug)) hash = (Math.imul(hash, 37) + char.codePointAt(0)) >>> 0
  return localCovers[hash % localCovers.length]
}

/** Cover 展示阶段只选择地址：显式本地/HTTPS cover 优先，缺省才用本地图；不请求接口、不探测远程响应。 */
export function resolveArticleCover(src, slug = '') {
  return src || coverFallback(slug)
}
